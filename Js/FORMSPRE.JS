document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          form.style.display = "none";
          alert("¡Correo enviado exitosamente!");
        } else {
          alert("Hubo un error al enviar el formulario.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error de red. Intenta nuevamente.");
      });
    });
  });


  /*---------Send notify from calendly----------*/
window.addEventListener('message', function(e) {
    if (e.data.event === 'calendly.event_scheduled') {
      alert("¡Gracias por agendar tu cita!");
    }
  });