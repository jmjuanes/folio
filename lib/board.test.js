import {createBoard} from "./board.js";

jest.mock("@elements/index.jsx", () => ({
    getElementConfig: () => null,
    createNewElement: () => ({
        id: ""
    }),
}));

jest.mock("uid/secure", () => ({
    uid: () => "",
}));

describe("board", () => {
    let board = null;

    beforeEach(() => {
        board = createBoard({});
    });

    describe("initialization", () => {
        it("should return an empty board", () => {
            expect(board.elements).toHaveLength(0);
            expect(board.history).toHaveLength(0);
        });
    });

    describe("layers", () => {
        beforeEach(() => {
            board.elements = [
                {id: "el0", initialOrder: 0, order: 0, selected: false},
                {id: "el1", initialOrder: 1, order: 1, selected: false},
                {id: "el2", initialOrder: 2, order: 2, selected: false},
                {id: "el3", initialOrder: 3, order: 3, selected: false},
            ];
        });

        it("should bring a single element forward", () => {
            const element = board.elements[1];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            board.bringElementsForward([element]);

            expect(element.order).toEqual(element.initialOrder + 1);
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a selection forward", () => {
            const elements = [
                board.elements[1],
                board.elements[2],
            ];
            const expectedOrder = ["el0", "el3", "el1", "el2"];
            board.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a non-consecutive selection forward", () => {
            const elements = [
                board.elements[0],
                board.elements[2],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            board.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in front", () => {
            const elements = [
                board.elements[2],
                board.elements[3],
            ];
            board.bringElementsForward(elements);

            board.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should send a single element backward", () => {
            const element = board.elements[2];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            board.sendElementsBackward([element]);

            expect(element.order).toEqual(element.initialOrder - 1);
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a selection backward", () => {
            const elements = [
                board.elements[1],
                board.elements[2],
            ];
            const expectedOrder = ["el1", "el2", "el0", "el3"];
            board.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a non-consecutive selection backward", () => {
            const elements = [
                board.elements[1],
                board.elements[3],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            board.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            board.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in back", () => {
            const elements = [
                board.elements[0],
                board.elements[1],
            ];
            board.sendElementsBackward(elements);

            board.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should bring a single element to front", () => {
            const element = board.elements[1];
            const lastOrder = board.elements.length - 1;
            board.bringElementsToFront([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(lastOrder);
            board.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder - 1);
                }
            });
        });

        it("should send a single element to back", () => {
            const element = board.elements[2];
            board.sendElementsToBack([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(0);
            board.elements.forEach(el => {
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder + 1);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
            });
        });

        it("should keep current order when bring all elements to front", () => {
            board.bringElementsToFront(board.elements);
            board.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should keep current order when send all elements to back", () => {
            board.sendElementsToBack(board.elements);
            board.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });
    });
});
