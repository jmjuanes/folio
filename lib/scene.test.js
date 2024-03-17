import {createScene} from "./scene.js";

jest.mock("@lib/elements.js", () => ({
    getElementConfig: () => null,
    createElement: () => ({
        id: ""
    }),
}));

jest.mock("uid/secure", () => ({
    uid: () => "id" + Math.floor(Math.random() * 1000).toString(6),
}));

describe("scene", () => {
    let scene = null;

    beforeEach(() => {
        scene = createScene({});
    });

    describe("initialization", () => {
        it("should return an empty scene", () => {
            expect(scene.page.elements).toHaveLength(0);
            expect(scene.page.history).toHaveLength(0);
        });
    });

    describe("layers", () => {
        beforeEach(() => {
            scene.page.elements = [
                {id: "el0", initialOrder: 0, order: 0, selected: false},
                {id: "el1", initialOrder: 1, order: 1, selected: false},
                {id: "el2", initialOrder: 2, order: 2, selected: false},
                {id: "el3", initialOrder: 3, order: 3, selected: false},
            ];
        });

        it("should bring a single element forward", () => {
            const element = scene.page.elements[1];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            scene.bringElementsForward([element]);

            expect(element.order).toEqual(element.initialOrder + 1);
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a selection forward", () => {
            const elements = [
                scene.page.elements[1],
                scene.page.elements[2],
            ];
            const expectedOrder = ["el0", "el3", "el1", "el2"];
            scene.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a non-consecutive selection forward", () => {
            const elements = [
                scene.page.elements[0],
                scene.page.elements[2],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            scene.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in front", () => {
            const elements = [
                scene.page.elements[2],
                scene.page.elements[3],
            ];
            scene.bringElementsForward(elements);

            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should send a single element backward", () => {
            const element = scene.page.elements[2];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            scene.sendElementsBackward([element]);

            expect(element.order).toEqual(element.initialOrder - 1);
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a selection backward", () => {
            const elements = [
                scene.page.elements[1],
                scene.page.elements[2],
            ];
            const expectedOrder = ["el1", "el2", "el0", "el3"];
            scene.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a non-consecutive selection backward", () => {
            const elements = [
                scene.page.elements[1],
                scene.page.elements[3],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            scene.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in back", () => {
            const elements = [
                scene.page.elements[0],
                scene.page.elements[1],
            ];
            scene.sendElementsBackward(elements);

            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should bring a single element to front", () => {
            const element = scene.page.elements[1];
            const expectedOrder = ["el0", "el2", "el3", "el1"];
            scene.bringElementsToFront([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(scene.page.elements.length - 1);
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder - 1);
                }
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a single element to back", () => {
            const element = scene.page.elements[2];
            const expectedOrder = ["el2", "el0", "el1", "el3"];
            scene.sendElementsToBack([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(0);
            scene.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder + 1);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
            });
            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep current order when bring all elements to front", () => {
            scene.bringElementsToFront([...scene.page.elements]);
            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should keep current order when send all elements to back", () => {
            scene.sendElementsToBack([...scene.page.elements]);
            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });
    });

    describe("groups", () => {
        beforeEach(() => {
            scene.page.elements = [
                {id: "el0", order: 0, group: null},
                {id: "el1", order: 1, group: null},
                {id: "el2", order: 2, group: null},
                {id: "el3", order: 3, group: null},
                {id: "el4", order: 4, group: null},
            ];
        });

        it("should generate a group with the provided elements", () => {
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);

            expect(scene.page.elements[1].group).not.toBe(null);
            expect(scene.page.elements[2].group).not.toBe(null);
        });

        it("should change order of grouped elements to make them consecutive", () => {
            scene.groupElements([scene.page.elements[1], scene.page.elements[3]]);

            ["el0", "el2", "el1", "el3", "el4"].forEach((id, index) => {
                expect(scene.page.elements[index].id).toEqual(id);
                expect(scene.page.elements[index].order).toEqual(index);
            });

            scene.groupElements([scene.page.elements[1], scene.page.elements[4]]);

            ["el0", "el1", "el3", "el2", "el4"].forEach((id, index) => {
                expect(scene.page.elements[index].id).toEqual(id);
                expect(scene.page.elements[index].order).toEqual(index);
            });
        });

        it("should move the whole group backward", () => {
            const expectedOrder = ["el1", "el2", "el0", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.sendElementsBackward([scene.page.elements[1], scene.page.elements[2]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group forward", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.bringElementsForward([scene.page.elements[1], scene.page.elements[2]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should maintain all elements order in group consecutive when moving an element forward", () => {
            const expectedOrder = ["el1", "el2", "el0", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.bringElementsForward([scene.page.elements[0]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should maintain all elements order in group consecutive when moving an element backward", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.sendElementsBackward([scene.page.elements[3]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it forward and the next element is another group", () => {
            const expectedOrder = ["el2", "el3", "el0", "el1", "el4"];
            scene.groupElements([scene.page.elements[0], scene.page.elements[1]]);
            scene.groupElements([scene.page.elements[2], scene.page.elements[3]]);
            scene.bringElementsForward([scene.page.elements[0], scene.page.elements[1]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it backward and the prev element is another group", () => {
            const expectedOrder = ["el2", "el3", "el0", "el1", "el4"];
            scene.groupElements([scene.page.elements[0], scene.page.elements[1]]);
            scene.groupElements([scene.page.elements[2], scene.page.elements[3]]);
            scene.sendElementsBackward([scene.page.elements[2], scene.page.elements[3]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it to front and the next element is another group", () => {
            const expectedOrder = ["el2", "el3", "el4", "el0", "el1"];
            scene.groupElements([scene.page.elements[0], scene.page.elements[1]]);
            scene.groupElements([scene.page.elements[3], scene.page.elements[4]]);
            scene.bringElementsToFront([scene.page.elements[0], scene.page.elements[1]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it to back and the prev element is another group", () => {
            const expectedOrder = ["el3", "el4", "el0", "el1", "el2"];
            scene.groupElements([scene.page.elements[0], scene.page.elements[1]]);
            scene.groupElements([scene.page.elements[3], scene.page.elements[4]]);
            scene.sendElementsToBack([scene.page.elements[3], scene.page.elements[4]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should bring an element forward inside the group", () => {
            const expectedOrder = ["el0", "el2", "el1", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.bringElementsForward([scene.page.elements[1]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should send an element backward inside the group", () => {
            const expectedOrder = ["el0", "el2", "el1", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.sendElementsBackward([scene.page.elements[2]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should bring an element forward and send it to the prev order inside the group", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            const element = scene.page.elements[2];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2], scene.page.elements[3]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.bringElementsForward([element]);
            scene.sendElementsBackward([element]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when all elements inside the group are already in the front", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.bringElementsForward([scene.page.elements[2]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when all elements inside the group are already in the back", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.sendElementsBackward([scene.page.elements[1]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move elements to front inside the active group", () => {
            const expectedOrder = ["el0", "el2", "el3", "el1", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2], scene.page.elements[3]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.bringElementsToFront([scene.page.elements[1]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when elements in group are already in the front", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2], scene.page.elements[3]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.bringElementsToFront([scene.page.elements[2], scene.page.elements[3]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move elements to back inside the active group", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2], scene.page.elements[3]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.sendElementsToBack([scene.page.elements[3]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when elements in group are already in the back", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            scene.groupElements([scene.page.elements[1], scene.page.elements[2], scene.page.elements[3]]);
            scene.page.activeGroup = scene.page.elements[1].group;
            scene.sendElementsToBack([scene.page.elements[1], scene.page.elements[2]]);

            scene.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });
    });
});
