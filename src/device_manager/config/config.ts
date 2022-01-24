import { ModuleConfig } from "common/module";

export default class DeviceManagerConfig extends ModuleConfig {
  name = "DeviceManager";
  // The device `id` to select on start, if not indicated, the first available from `devices` will be used.
  default?: string;
  protected stylePrefix = undefined;

  // Default devices
  devices = [
    {
      id: "desktop",
      name: "Desktop",
      width: ""
    },
    {
      id: "tablet",
      name: "Tablet",
      width: "768px",
      widthMedia: "992px"
    },
    {
      id: "mobileLandscape",
      name: "Mobile landscape",
      width: "568px",
      widthMedia: "768px"
    },
    {
      id: "mobilePortrait",
      name: "Mobile portrait",
      width: "320px",
      widthMedia: "480px"
    }
  ];
}
