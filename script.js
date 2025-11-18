document.addEventListener('DOMContentLoaded', () => {
    console.log("Webseite geladen und bereit!");
    // Hier könnten weitere interaktive Elemente mit JavaScript hinzugefügt werden.
    // Zum Beispiel, wenn du Animationen oder dynamische Inhalte haben möchtest.

    // Beispiel: Einfache Animation für das Speech Bubble (optional)
    const speechBubble = document.querySelector('.speech-bubble');
    if (speechBubble) {
        speechBubble.style.opacity = 0;
        speechBubble.style.transform = 'translateY(10px)';
        setTimeout(() => {
            speechBubble.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            speechBubble.style.opacity = 1;
            speechBubble.style.transform = 'translateY(0)';
        }, 1000); // Verzögert die Animation um 1 Sekunde nach dem Laden
    }
});