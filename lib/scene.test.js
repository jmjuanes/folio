import {createScene} from "./scene.js";

jest.mock("@lib/elements.js", () => ({
    getElementConfig: () => null,
    createElement: () => ({
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
            const lastOrder = scene.page.elements.length - 1;
            scene.bringElementsToFront([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(lastOrder);
            scene.page.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder - 1);
                }
            });
        });

        it("should send a single element to back", () => {
            const element = scene.page.elements[2];
            scene.sendElementsToBack([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(0);
            scene.page.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder + 1);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
            });
        });

        it("should keep current order when bring all elements to front", () => {
            scene.bringElementsToFront(scene.page.elements);
            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should keep current order when send all elements to back", () => {
            scene.sendElementsToBack(scene.page.elements);
            scene.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });
    });
});
