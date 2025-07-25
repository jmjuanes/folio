import { jest, expect, describe, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.unstable_mockModule("react-use", () => ({
    useLocalStorage: jest.fn(() => ([
        "MOCKED_TOKEN", jest.fn(), jest.fn(),
    ])),   
}));

jest.unstable_mockModule("../../hooks/use-api.ts", () => ({
    useApi: jest.fn(),
}));

const { ClientProvider, useClient } = await import("../client.tsx");


describe("ClientProvider", () => {
    const InnerComponent = () => {
        const client = useClient();
        return <div>{client.token}</div>;
    };

    it("should render children with the client context", () => {
        render(
            <ClientProvider>
                <span>Hello world</span>
            </ClientProvider>
        );
        expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("should provide the client context with the token", () => {
        render(
            <ClientProvider>
                <InnerComponent />
            </ClientProvider>
        );
        expect(screen.getByText("MOCKED_TOKEN")).toBeInTheDocument();
    });
});
