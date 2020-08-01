// src/directives/vTyping.js
export const vTyping = {
    mounted(el, binding) {
      const options = binding.value || {};
      let i = 0;
      let txt = options.text || '';
      const speed = options.typeSpeed || 50;
      const backSpeed = options.backSpeed || 30;
      const backDelay = options.backDelay || 2000;
      
      function typeWriter() {
        if (i < txt.length) {
          el.innerHTML += txt.charAt(i);
          i++;
          setTimeout(typeWriter, speed);
        } else if (options.loop) {
          setTimeout(eraseText, backDelay);
        }
      }
      
      function eraseText() {
        if (i > 0) {
          el.innerHTML = txt.substring(0, i-1);
          i--;
          setTimeout(eraseText, backSpeed);
        } else {
          i = 0;
          setTimeout(typeWriter, speed);
        }
      }
      
      // Start the typing effect
      typeWriter();
  
      // Add a watcher for text changes
      binding.instance.$watch(() => binding.value.text, (newText) => {
        txt = newText;
        i = 0;
        el.innerHTML = '';
        typeWriter();
      });
    }
  };