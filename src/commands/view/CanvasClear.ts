import Editor from "editor";
import { CommandAbstract } from "./CommandAbstract";

export default class CanvasClear extends CommandAbstract{
  run() {
    this.em.DomComponents.clear();
    this.em.CssComposer.clear();
  }
};
