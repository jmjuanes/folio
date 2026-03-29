import { FIELDS, CHANGES } from "../../constants.js";
import { ToolState } from "../../lib/tool.ts";
import { clampAngle, snapAngle, rotatePoints } from "../../utils/math.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectRotatingState extends ToolState {
    private rotated: boolean = false;
    private snapshot: any[] = [];

    onEnter(params: any = {}) {
        const selectedElements = this.editor.getSelection();
        this.rotated = false;
        this.snapshot = selectedElements.map((element: any) => Object.assign({}, element));
        this.editor.setSnaps([]);
    }

    onPointerMove(event: EditorPointEvent) {
        if (this.snapshot.length === 1) {
            this.rotated = true;
            const element = this.editor.getElement(this.snapshot[0].id);
            const cx = (this.snapshot[0].x1 + this.snapshot[0].x2) / 2;
            const cy = (this.snapshot[0].y1 + this.snapshot[0].y2) / 2;
            const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
            const currentAngle = Math.atan2((event.currentY ?? cy) - cy, (event.currentX ?? cx) - cx) + Math.PI / 2;
            const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
            const newPoints = rotatePoints([
                [this.snapshot[0].x1, this.snapshot[0].y1],
                [this.snapshot[0].x2, this.snapshot[0].y2],
            ], [cx, cy], deltaAngle);
            element.x1 = newPoints[0][0];
            element.y1 = newPoints[0][1];
            element.x2 = newPoints[1][0];
            element.y2 = newPoints[1][1];
            element.rotation = clampAngle((this.snapshot[0].rotation || 0) + deltaAngle);
        }
    }

    onPointerUp(event: EditorPointEvent) {
        if (this.rotated) {
            const selectedElements = this.editor.getSelection();
            // TODO: execute onRotateEnd listener in all elements of the selection
            // update version in all elements
            selectedElements.forEach((element: any) => {
                element[FIELDS.VERSION] = element[FIELDS.VERSION] + 1;
            });
            // 2. register the history change in all elements
            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((element: any, index: number) => {
                    const keys = ["x1", "x2", "y1", "y2", "rotation", "version"];
                    return {
                        id: element.id,
                        prevValues: Object.fromEntries(keys.map(k => [k, this.snapshot[index][k]])),
                        newValues: Object.fromEntries(keys.map(k => [k, element[k]])),
                    };
                }),
            });
            this.editor.dispatchChange();
        }
        this.rotated = false;
        this.snapshot = [];
        this.parent?.transition("idle");
    }
};
