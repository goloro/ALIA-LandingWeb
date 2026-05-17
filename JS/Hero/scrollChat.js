/**
 * Módulo para forzar el scroll del contenedor hacia el fondo.
 */
export const scrollToBottom = (container) => {
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
};
