document.addEventListener('DOMContentLoaded', function () {
    const messageInput = document.getElementById('message-input');
    const form = document.querySelector('form');

    // Focus input on page load
    messageInput.focus();

    // Auto-scroll to latest message if exists
    const latestMessage = document.getElementById('latest-message');
    if (latestMessage) {
        latestMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Simple keyboard navigation - Enter submits form
    messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            form.submit();
        }
    });
});