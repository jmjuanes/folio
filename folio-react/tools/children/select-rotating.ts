import { FIELDS, CHANGES } from "../../constants.js";
import { ToolState } from "../../lib/tool.ts";
import { clampAngle, snapAngle, rotatePoints } from "../../utils/math.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectRotatingState extends ToolState {
    onPointerMove(event: EditorPointEvent) {
        const parent = this.parent as any;
        const element = this.editor.getElement(parent.snapshot[0].id);
        const cx = (parent.snapshot[0].x1 + parent.snapshot[0].x2) / 2;
        const cy = (parent.snapshot[0].y1 + parent.snapshot[0].y2) / 2;
        const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
        const currentAngle = Math.atan2((event.currentY ?? cy) - cy, (event.currentX ?? cx) - cx) + Math.PI / 2;
        const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
        element.rotation = clampAngle((parent.snapshot[0].rotation || 0) + deltaAngle);
        const newPoints = rotatePoints([[parent.snapshot[0].x1, parent.snapshot[0].y1], [parent.snapshot[0].x2, parent.snapshot[0].y2]], [cx, cy], deltaAngle);
        element.x1 = newPoints[0][0]; element.y1 = newPoints[0][1]; element.x2 = newPoints[1][0]; element.y2 = newPoints[1][1];
    }

    onPointerUp(event: EditorPointEvent) {
        const parent = this.parent as any;
        const selectedElements = this.editor.getSelection();

        // update version in all elements
        selectedElements.forEach((element: any) => {
            element[FIELDS.VERSION] = element[FIELDS.VERSION] + 1;
        });

        this.editor.addHistory({
            type: CHANGES.UPDATE,
            elements: selectedElements.map((element: any, index: number) => {
                const keys = ["x1", "x2", "y1", "y2", "rotation", "version"];
                return {
                    id: element.id,
                    prevValues: Object.fromEntries(keys.map(k => [k, parent.snapshot[index][k]])),
                    newValues: Object.fromEntries(keys.map(k => [k, element[k]])),
                };
            }),
        });
        this.editor.dispatchChange();
        this.parent?.transition("idle");
    }
};
