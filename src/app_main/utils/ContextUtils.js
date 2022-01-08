import { screen } from "electron";

export function externalDisplay() {
  let externalDisplay = screen.getAllDisplays().find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });
  return externalDisplay;
}
