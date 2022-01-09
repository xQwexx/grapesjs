import Backbone from "backbone";
import AssetImage from "./AssetImage";
import AssetImageView from "../view/AssetImageView";
import TypeableCollection from "domain_abstract/model/TypeableCollection";

export default class Assets extends TypeableCollection {
  types = [
    {
      id: "image",
      model: AssetImage,
      view: AssetImageView,
      isType(value: any) {
        if (typeof value == "string") {
          return {
            type: "image",
            src: value
          };
        }
        return value;
      }
    }
  ];
}
