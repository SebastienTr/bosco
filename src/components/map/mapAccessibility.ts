export const MAP_ARIA_ROLE = "application";

export function applyMapAccessibility(
  container: HTMLElement,
  ariaLabel: string
) {
  container.setAttribute("role", MAP_ARIA_ROLE);
  container.setAttribute("aria-label", ariaLabel);
}
