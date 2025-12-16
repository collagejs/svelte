import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { buildPieceFactory } from "./collage.svelte.ts";
import Dummy from "../testing/Dummy.svelte";
import { mountPieceKey } from "@collagejs/core";
import { createRawSnippet } from "svelte";

const mountMock = vi.fn();
const unmountMock = vi.fn();
const buildPiece = buildPieceFactory(mountMock, unmountMock);

describe("buildPiece", () => {
    beforeEach(() => {
        mountMock.mockReturnValue({});
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("Should throw an error when no component is given to it.", () => {
        // @ts-expect-error Testing error case
        expect(() => buildPiece(undefined)).toThrowError();
    });
    test("Should emit a warning when 'target' is specified in mount options.", () => {
        const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
        buildPiece(Dummy, {
            mount: {
                // @ts-expect-error target is not allowed here
                target: document.createElement("div")
            }
        });
        expect(consoleWarnSpy).toHaveBeenCalledOnce();
        consoleWarnSpy.mockRestore();
    });
    test("Should return an object compliant with the CorePiece interface.", async () => {
        const piece = buildPiece(Dummy);
        expect(piece).toHaveProperty("mount");
        expect(typeof piece.mount).toBe("function");
        expect(piece).toHaveProperty("update");
        expect(typeof piece.update).toBe("function");
        const unmountPromise = piece.mount(document.createElement("div"));
        expect(unmountPromise).toBeInstanceOf(Promise);
        const unmountFn = await unmountPromise;
        expect(unmountFn).toBeInstanceOf(Function);
    });
    describe("Mounting", () => {
        test("Should call preMount with the provided target before mounting.", async () => {
            const preMountMock = vi.fn(() => {
                expect(mountMock).not.toHaveBeenCalledOnce();
                return Promise.resolve();
            });
            const piece = buildPiece(Dummy, {
                preMount: preMountMock
            });
            const target = document.createElement("div");
            await piece.mount(target);
            expect(preMountMock).toHaveBeenCalledOnce();
            expect(preMountMock).toHaveBeenCalledWith(target);
        });
        test("Should preserve any incoming context when mounting.", async () => {
            const context = new Map()
                .set("testKey", "testValue");
            const piece = buildPiece(Dummy, {
                mount: {
                    context
                }
            });
            await piece.mount(document.createElement("div"));
            const mountOptions = mountMock.mock.calls[0][1];
            expect(mountOptions.context).toBeInstanceOf(Map);
            expect(mountOptions.context.get("testKey")).toBe("testValue");
        });
        test("Should not pass the 'mountPiece' prop to the component being mounted.", async () => {
            const piece = buildPiece(Dummy);
            await piece.mount(document.createElement("div"), {
                [mountPieceKey]: vi.fn(),
            });
            const mountOptions = mountMock.mock.calls[0][1];
            expect(Object.getOwnPropertySymbols(mountOptions.props)).not.toContain(mountPieceKey);
        });
        test("Should merge props from mount options and mount call, with mount call taking precedence.", async () => {
            const piece = buildPiece(Dummy, {
                mount: {
                    props: {
                        propA: "fromMountOptions",
                        propB: "fromMountOptions"
                    }
                }
            });
            await piece.mount(document.createElement("div"), {
                propB: "fromMountCall",
                propC: "fromMountCall"
            });
            const mountOptions = mountMock.mock.calls[0][1];
            expect(mountOptions.props).toEqual({
                propA: "fromMountOptions",
                propB: "fromMountCall",
                propC: "fromMountCall"
            });
        });
        describe("Unmounting", () => {
            test("Should throw an error if there is no component to unmount.", async () => {
                mountMock.mockReturnValueOnce(undefined);
                const piece = buildPiece(Dummy);
                const target = document.createElement("div");
                const unmountFn = await piece.mount(target);
                await expect(() => unmountFn()).rejects.toThrowError();
            });
            test("Should call postUnmount with the provided target after unmounting.", async () => {
                const postUnmountMock = vi.fn(() => {
                    expect(unmountMock).toHaveBeenCalledOnce();
                    return Promise.resolve();
                });
                const piece = buildPiece(Dummy, {
                    postUnmount: postUnmountMock
                });
                const target = document.createElement("div");
                const unmountFn = await piece.mount(target);
                await unmountFn();
                expect(postUnmountMock).toHaveBeenCalledOnce();
                expect(postUnmountMock).toHaveBeenCalledWith(target);
            });
        });
    });
    describe("Updating", () => {
        test("Should throw an error if no component has been mounted.", async () => {
            const piece = buildPiece(Dummy);
            await expect(piece.update({})).rejects.toThrowError();
        });
        test("Should update the component's props when update is called.", async () => {
            const realBuildPiece = buildPieceFactory();
            let currentProps: Record<string, any> = {};
            const children = createRawSnippet<[Record<string, any>]>((argsFn) => {
                return {
                    render() {
                        const args = argsFn();
                        $inspect(args).with((t, v) => currentProps = $state.snapshot(v));
                        return `<div></div>`;
                    },
                }
            });
            const piece = realBuildPiece(Dummy);
            await piece.mount(document.createElement("div"), {
                children,
                propA: "initialA",
                propB: "initialB"
            });
            expect(currentProps).toEqual({
                propA: "initialA",
                propB: "initialB"
            });
            await piece.update({
                propB: "updatedB",
                propC: "newC"
            });
            expect(currentProps).toEqual({
                propA: "initialA",
                propB: "updatedB",
                propC: "newC"
            });
        });
    });
});
