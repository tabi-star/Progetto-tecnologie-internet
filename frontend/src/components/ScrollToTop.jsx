/*import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()*/

  /*useEffect(() => {
    window.scrollTo(0, 0)
    //window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])*/

  //Per dire manualmente al browser che sono io a far scrollare in alto e che lui non deve emorizzare nulla della posizione attuale della pagina
  /*useEffect(() => {
    // Piccolo delay per evitare il ripristino automatico del browser
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Disattiva il comportamento di "scroll restoration" del browser
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null
}

export default ScrollToTop*/

/*comportamento corretto ma incompleto del ScrollToTop “base”:
funziona solo quando React Router cambia pathname in avanti, ma non intercetta lo scroll salvato dal browser quando torni indietro (Back o Forward del browser).

Il motivo è che i browser (Chrome, Firefox, Safari, ecc.) per impostazione predefinita memorizzano la posizione di scroll della pagina precedente, e quando torni indietro la ripristinano automaticamente, 
prima ancora che React Router monti il componente.*/

/*🔍 Cosa cambia

window.history.scrollRestoration = "manual";
→ dice al browser: “Non gestire tu lo scroll, ci penso io”.

Il piccolo setTimeout() serve perché a volte il browser riporta la posizione scrollata dopo il render.
Aspettando 50 ms, React ha tempo di montare la nuova pagina prima che lo scroll venga resettato.

✅ Effetto finale

Quando navighi avanti o indietro, la pagina torna sempre in cima.

Funziona con Link, navigate(), e anche col tasto “← Indietro” del browser.*/

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  useEffect(() => {
    // Scrolla solo se il vero pathname è cambiato
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "instant"
        });
      }, 80);
    }
  }, [pathname]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null;
};

export default ScrollToTop;

/*import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Piccolo delay per evitare il ripristino automatico del browser
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Disattiva il comportamento di "scroll restoration" del browser
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null;
};

export default ScrollToTop;*/