import { jest } from "@jest/globals";

jest.unstable_mockModule("../elements.js", () => ({
    getElementConfig: () => null,
    createElement: () => ({
        id: ""
    }),
    getElementsBoundingRectangle: jest.fn(() => {
        return [ [0, 0], [100, 100] ];
    }),
    measureTextInElement: jest.fn(),
    getElementDisplayName: jest.fn(),
}));
jest.unstable_mockModule("../export.js", () => ({
    exportToDataURL: jest.fn(),
}));
jest.unstable_mockModule("../migrate.js", () => ({
    migrateElements: jest.fn(),
}));
// jest.unstable_mockModule("../library.js", () => ({
//     getLibraryStateFromInitialData: jest.fn(),
//     createLibraryComponent: jest.fn(),
// }));

jest.unstable_mockModule("browser-fs-access", () => ({
    fileOpen: jest.fn(),
    fileSave: jest.fn(),
}));
jest.unstable_mockModule("uid/secure", () => ({
    uid: () => "id" + Math.floor(Math.random() * 1000).toString(6),
}));

const { createEditor } = await import("../editor.js");

describe("editor", () => {
    let editor = null;

    beforeEach(() => {
        editor = createEditor({});
    });

    describe("initialization", () => {
        it("should return an empty editor", () => {
            expect(editor.page.elements).toHaveLength(0);
            expect(editor.page.history).toHaveLength(0);
        });
    });

    describe("layers", () => {
        beforeEach(() => {
            editor.page.elements = [
                {id: "el0", initialOrder: 0, order: 0, selected: false},
                {id: "el1", initialOrder: 1, order: 1, selected: false},
                {id: "el2", initialOrder: 2, order: 2, selected: false},
                {id: "el3", initialOrder: 3, order: 3, selected: false},
            ];
        });

        it("should bring a single element forward", () => {
            const element = editor.page.elements[1];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            editor.bringElementsForward([element]);

            expect(element.order).toEqual(element.initialOrder + 1);
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a selection forward", () => {
            const elements = [
                editor.page.elements[1],
                editor.page.elements[2],
            ];
            const expectedOrder = ["el0", "el3", "el1", "el2"];
            editor.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should bring a non-consecutive selection forward", () => {
            const elements = [
                editor.page.elements[0],
                editor.page.elements[2],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            editor.bringElementsForward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder + 1);
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in front", () => {
            const elements = [
                editor.page.elements[2],
                editor.page.elements[3],
            ];
            editor.bringElementsForward(elements);

            editor.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should send a single element backward", () => {
            const element = editor.page.elements[2];
            const expectedOrder = ["el0", "el2", "el1", "el3"];
            editor.sendElementsBackward([element]);

            expect(element.order).toEqual(element.initialOrder - 1);
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a selection backward", () => {
            const elements = [
                editor.page.elements[1],
                editor.page.elements[2],
            ];
            const expectedOrder = ["el1", "el2", "el0", "el3"];
            editor.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a non-consecutive selection backward", () => {
            const elements = [
                editor.page.elements[1],
                editor.page.elements[3],
            ];
            const expectedOrder = ["el1", "el0", "el3", "el2"];
            editor.sendElementsBackward(elements);

            elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder - 1);
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep order when all selected elements are already in back", () => {
            const elements = [
                editor.page.elements[0],
                editor.page.elements[1],
            ];
            editor.sendElementsBackward(elements);

            editor.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should bring a single element to front", () => {
            const element = editor.page.elements[1];
            const expectedOrder = ["el0", "el2", "el3", "el1"];
            editor.bringElementsToFront([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(editor.page.elements.length - 1);
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder - 1);
                }
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should send a single element to back", () => {
            const element = editor.page.elements[2];
            const expectedOrder = ["el2", "el0", "el1", "el3"];
            editor.sendElementsToBack([element]);

            expect(element.order).not.toEqual(element.initialOrder);
            expect(element.order).toEqual(0);
            editor.page.elements.forEach((el, index) => {
                expect(el.order).toEqual(index);
                if (el.initialOrder < element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder + 1);
                }
                else if (el.initialOrder > element.initialOrder) {
                    expect(el.order).toEqual(el.initialOrder);
                }
            });
            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
            });
        });

        it("should keep current order when bring all elements to front", () => {
            editor.bringElementsToFront([...editor.page.elements]);
            editor.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });

        it("should keep current order when send all elements to back", () => {
            editor.sendElementsToBack([...editor.page.elements]);
            editor.page.elements.forEach(el => {
                expect(el.order).toEqual(el.initialOrder);
            });
        });
    });

    describe("groups", () => {
        beforeEach(() => {
            editor.page.elements = [
                {id: "el0", order: 0, group: null},
                {id: "el1", order: 1, group: null},
                {id: "el2", order: 2, group: null},
                {id: "el3", order: 3, group: null},
                {id: "el4", order: 4, group: null},
            ];
        });

        it("should generate a group with the provided elements", () => {
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);

            expect(editor.page.elements[1].group).not.toBe(null);
            expect(editor.page.elements[2].group).not.toBe(null);
        });

        it("should change order of grouped elements to make them consecutive", () => {
            editor.groupElements([editor.page.elements[1], editor.page.elements[3]]);

            ["el0", "el2", "el1", "el3", "el4"].forEach((id, index) => {
                expect(editor.page.elements[index].id).toEqual(id);
                expect(editor.page.elements[index].order).toEqual(index);
            });

            editor.groupElements([editor.page.elements[1], editor.page.elements[4]]);

            ["el0", "el1", "el3", "el2", "el4"].forEach((id, index) => {
                expect(editor.page.elements[index].id).toEqual(id);
                expect(editor.page.elements[index].order).toEqual(index);
            });
        });

        it("should move the whole group backward", () => {
            const expectedOrder = ["el1", "el2", "el0", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.sendElementsBackward([editor.page.elements[1], editor.page.elements[2]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group forward", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.bringElementsForward([editor.page.elements[1], editor.page.elements[2]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should maintain all elements order in group consecutive when moving an element forward", () => {
            const expectedOrder = ["el1", "el2", "el0", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.bringElementsForward([editor.page.elements[0]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should maintain all elements order in group consecutive when moving an element backward", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.sendElementsBackward([editor.page.elements[3]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it forward and the next element is another group", () => {
            const expectedOrder = ["el2", "el3", "el0", "el1", "el4"];
            editor.groupElements([editor.page.elements[0], editor.page.elements[1]]);
            editor.groupElements([editor.page.elements[2], editor.page.elements[3]]);
            editor.bringElementsForward([editor.page.elements[0], editor.page.elements[1]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it backward and the prev element is another group", () => {
            const expectedOrder = ["el2", "el3", "el0", "el1", "el4"];
            editor.groupElements([editor.page.elements[0], editor.page.elements[1]]);
            editor.groupElements([editor.page.elements[2], editor.page.elements[3]]);
            editor.sendElementsBackward([editor.page.elements[2], editor.page.elements[3]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it to front and the next element is another group", () => {
            const expectedOrder = ["el2", "el3", "el4", "el0", "el1"];
            editor.groupElements([editor.page.elements[0], editor.page.elements[1]]);
            editor.groupElements([editor.page.elements[3], editor.page.elements[4]]);
            editor.bringElementsToFront([editor.page.elements[0], editor.page.elements[1]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move the whole group when moving it to back and the prev element is another group", () => {
            const expectedOrder = ["el3", "el4", "el0", "el1", "el2"];
            editor.groupElements([editor.page.elements[0], editor.page.elements[1]]);
            editor.groupElements([editor.page.elements[3], editor.page.elements[4]]);
            editor.sendElementsToBack([editor.page.elements[3], editor.page.elements[4]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should bring an element forward inside the group", () => {
            const expectedOrder = ["el0", "el2", "el1", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.bringElementsForward([editor.page.elements[1]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should send an element backward inside the group", () => {
            const expectedOrder = ["el0", "el2", "el1", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.sendElementsBackward([editor.page.elements[2]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should bring an element forward and send it to the prev order inside the group", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            const element = editor.page.elements[2];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2], editor.page.elements[3]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.bringElementsForward([element]);
            editor.sendElementsBackward([element]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when all elements inside the group are already in the front", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.bringElementsForward([editor.page.elements[2]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when all elements inside the group are already in the back", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.sendElementsBackward([editor.page.elements[1]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move elements to front inside the active group", () => {
            const expectedOrder = ["el0", "el2", "el3", "el1", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2], editor.page.elements[3]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.bringElementsToFront([editor.page.elements[1]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when elements in group are already in the front", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2], editor.page.elements[3]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.bringElementsToFront([editor.page.elements[2], editor.page.elements[3]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should move elements to back inside the active group", () => {
            const expectedOrder = ["el0", "el3", "el1", "el2", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2], editor.page.elements[3]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.sendElementsToBack([editor.page.elements[3]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep order when elements in group are already in the back", () => {
            const expectedOrder = ["el0", "el1", "el2", "el3", "el4"];
            editor.groupElements([editor.page.elements[1], editor.page.elements[2], editor.page.elements[3]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.sendElementsToBack([editor.page.elements[1], editor.page.elements[2]]);

            editor.page.elements.forEach((el, index) => {
                expect(el.id).toEqual(expectedOrder[index]);
                expect(el.order).toEqual(index);
            });
        });

        it("should keep groups when duplicating elements", () => {
            const prevElementsLength = editor.page.elements.length;
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.duplicateElements([editor.page.elements[1], editor.page.elements[2]]);

            expect(editor.page.elements.length).toEqual(prevElementsLength + 2);
            expect(editor.page.elements[prevElementsLength].group).toEqual(editor.page.elements[prevElementsLength + 1].group);
        });

        it("should keep group when duplicating an element inside a group", () => {
            const prevElementsLength = editor.page.elements.length;
            editor.groupElements([editor.page.elements[1], editor.page.elements[2]]);
            editor.page.activeGroup = editor.page.elements[1].group;
            editor.duplicateElements([editor.page.elements[1]]);

            expect(editor.page.elements.length).toEqual(prevElementsLength + 1);
            expect(editor.page.elements[2].group).toEqual(editor.page.elements[1].group);
            expect(editor.page.elements[3].group).toEqual(editor.page.elements[1].group);
        });
    });

    describe("pages", () => {
        it("should allow to duplicate the provided page", () => {
            editor.page.title = "PAGE";
            expect(editor.pages).toHaveLength(1);
            editor.duplicatePage(editor.page);
            expect(editor.pages).toHaveLength(2);
            expect(editor.pages[0].id).not.toEqual(editor.pages[1].id);
            expect(editor.pages[0].title).not.toEqual(editor.pages[1].title);
        });

        it("should change active page when duplicating", () => {
            editor.page.title = "PAGE";
            expect(editor.page.title).toEqual(editor.pages[0].title);
            editor.duplicatePage(editor.page);
            expect(editor.pages).toHaveLength(2);
            expect(editor.page.title).not.toEqual(editor.pages[0].title);
        });
    });
});
