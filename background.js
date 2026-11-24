import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3";

const EXT_ID = "com.mencius.combat.status";
const BASE_PATH = new URL("./", window.location.href).pathname;

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: `${EXT_ID}/context-menu`,
    icons: [
      {
        icon: `${BASE_PATH}icon.svg`,
        label: "孟子状态/血条/压力",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: "type", value: "IMAGE" },
          ],
        },
      },
    ],
    onClick(context, elementId) {
      const ids = context.items.map((item) => item.id).join(",");
      OBR.popover.open({
        id: `${EXT_ID}/popover`,
        url: `${BASE_PATH}index.html?targets=${encodeURIComponent(ids)}`,
        height: 660,
        width: 386,
        anchorElementId: elementId,
        anchorOrigin: { horizontal: "RIGHT", vertical: "CENTER" },
        transformOrigin: { horizontal: "LEFT", vertical: "CENTER" },
      });
    },
  });
});
