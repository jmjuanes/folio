import {createScene, sceneActions} from "./scene.js";

jest.mock("@lib/elements.js", () => ({
    getElementConfig: () => null,
    createNewElement: () => ({
        id: ""
    }),
}));

jest.mock("uid/secure", () => ({
    uid: () => "",
}));

describe("scene", () => {
    let scene = null;

    beforeEach(() => {
        scene = createScene({});
    });

    describe("initialization", () => {
        it("should return an empty scene", () => {
            expect(scene.elements).toHaveLength(0);
            expect(scene.history).toHaveLength(0);
        });
    });

    describe("layers", () => {
        beforeEach(() => {
            scene.elements = [
                {id: "el0", initialOrder: 0, order: 0, selected: false},
                {id: "el1", initialOrder: 1, order: 1, selected: false},
                {id: "el2", initialOrder: 2, order: 2, selected: false},
                {id: "el3", initialOrder: 3, order: 3, selected: false},
            ];
        });

        it("should bring a single element forward", () => {
            const element = scene.elements[1];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            sceneActions.bringElementsForward(scene, [element]);

            expect(element.order).toEqual(element.initialOrder + 1);
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a selection forward", () => {
            const elements = [
                scene.elements[1],
                scene.elements[2],
            ];
            const expectedOrder = ["el0", "el3", "el1", "el2"];
            sceneActions.bringElementsForward(scene, elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a non-consecutive selection forward", () => {
            const elements = [
                scene.elements[0],
                scene.elements[2],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            sceneActions.bringElementsForward(scene, elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in front", () => {
            const elements = [
                scene.elements[2],
                scene.elements[3],
            ];
            sceneActions.bringElementsForward(scene, elements);

            scene.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should send a single element backward", () => {
            const element = scene.elements[2];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            sceneActions.sendElementsBackward(scene, [element]);

            expect(element.order).toEqual(element.initialOrder - 1);
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a selection backward", () => {
            const elements = [
                scene.elements[1],
                scene.elements[2],
            ];
            const expectedOrder = ["el1", "el2", "el0", "el3"];
            sceneActions.sendElementsBackward(scene, elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a non-consecutive selection backward", () => {
            const elements = [
                scene.elements[1],
                scene.elements[3],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            sceneActions.sendElementsBackward(scene, elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            scene.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in back", () => {
            const elements = [
                scene.elements[0],
                scene.elements[1],
            ];
            sceneActions.sendElementsBackward(scene, elements);

            scene.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should bring a single element to front", () => {
            const element = scene.elements[1];
            const lastOrder = scene.elements.length - 1;
            sceneActions.bringElementsToFront(scene, [element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(lastOrder);
            scene.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder - 1);
                }
            });
        });

        it("should send a single element to back", () => {
            const element = scene.elements[2];
            sceneActions.sendElementsToBack(scene, [element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(0);
            scene.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder + 1);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
            });
        });

        it("should keep current order when bring all elements to front", () => {
            sceneActions.bringElementsToFront(scene, scene.elements);
            scene.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should keep current order when send all elements to back", () => {
            sceneActions.sendElementsToBack(scene, scene.elements);
            scene.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });
    });
});
