import time
from django.shortcuts import redirect
from django.urls import reverse

class UnauthenticatedRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow access to login, logout, unauth, static, and admin pages
        allowed_paths = [reverse('login'), reverse('logout'), '/unauth/', '/admin/', '/static/']
        # Always allow full interaction with login page
        if request.path == reverse('login') or request.path.startswith('/static/') or request.path.startswith('/admin/') or request.path == '/unauth/':
            return self.get_response(request)
        # If user is not authenticated
        if not request.user.is_authenticated:
            # If permanent unauth cookie is set, always redirect
            if request.COOKIES.get('blocked_unauth') == '1':
                return redirect('/unauth/')
            # Set a session timer on first visit
            if 'unauth_timer' not in request.session:
                request.session['unauth_timer'] = time.time()
            # Block all POST, PUT, DELETE actions for unauthenticated users immediately
            if request.method in ['POST', 'PUT', 'DELETE']:
                response = redirect('/unauth/')
                response.set_cookie('blocked_unauth', '1', max_age=10*365*24*60*60)
                return response
            # For GET requests, allow preview but block interaction with JS
            if request.method == 'GET':
                if time.time() - request.session['unauth_timer'] > 7:
                    response = redirect('/unauth/')
                    response.set_cookie('blocked_unauth', '1', max_age=10*365*24*60*60)
                    return response
                from django.http import HttpResponse
                js_block = '''<script>
function showWarning(e) {
    e.preventDefault();
    if (!document.getElementById('touch-warning')) {
        var warn = document.createElement('div');
        warn.id = 'touch-warning';
        warn.style.position = 'fixed';
        warn.style.top = '50%';
        warn.style.left = '50%';
        warn.style.transform = 'translate(-50%,-50%)';
        warn.style.zIndex = '99999';
        warn.style.background = 'rgba(255,255,255,0.95)';
        warn.style.border = '2px solid #d90429';
        warn.style.borderRadius = '50%';
        warn.style.width = '100px';
        warn.style.height = '100px';
        warn.style.display = 'flex';
        warn.style.alignItems = 'center';
        warn.style.justifyContent = 'center';
        warn.innerHTML = '<span style="color:#d90429;font-size:3rem;"><i class="fas fa-exclamation-circle"></i></span>';
        document.body.appendChild(warn);
        setTimeout(function(){ warn.remove(); }, 1200);
    }
}
['click','mousedown','mouseup','touchstart','touchend','wheel','keydown'].forEach(function(evt){
    document.addEventListener(evt, showWarning, {passive:false});
});
</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
'''
                # Inject JS block at end of body
                class JSInjectResponse(HttpResponse):
                    def __init__(self, content):
                        if '</body>' in content:
                            content = content.replace('</body>', js_block + '</body>')
                        else:
                            content += js_block
                        super().__init__(content)
                # Render dashboard as normal, but inject JS
                response = self.get_response(request)
                if hasattr(response, 'content') and b'</body>' in response.content:
                    response.content = response.content.replace(b'</body>', js_block.encode() + b'</body>')
                return response
        else:
            # Reset timer and cookie for authenticated users
            request.session.pop('unauth_timer', None)
            if request.COOKIES.get('blocked_unauth') == '1':
                response = self.get_response(request)
                response.delete_cookie('blocked_unauth')
                return response
        return self.get_response(request)
