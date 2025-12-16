import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { contextKey } from '$lib/collageContext.js';
import Piece, { piece } from './Piece.svelte';
import { mountPiece, mountPieceKey, type CorePiece } from '@collagejs/core';
import { buildTestPiece, pieceTestId } from '$lib/testing/piece-building.js';
import { delay } from '$lib/testing/utils.js';
import { flushSync } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

// @ts-expect-error
vi.mock(import('@collagejs/core'), async (importActual) => {
    const actual = await importActual()
    return {
        ...actual,
        mountPiece: vi.fn(actual.mountPiece)
    };
});

describe('Piece', () => {
    let testPiece: CorePiece;
    const testPieceCallbacks: Parameters<typeof buildTestPiece>[0] = {
        mount: vi.fn(),
        unmount: vi.fn(),
        update: vi.fn()
    };
    beforeEach(() => {
        testPiece = buildTestPiece(testPieceCallbacks);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Mounting', () => {
        test("Should obtain the mountPiece function from context.", async () => {
            const context = new Map();
            const mountPieceMock = vi.fn();
            mountPieceMock.mockReturnValue(Promise.resolve());
            context.set(contextKey, {
                mountPiece: mountPieceMock
            });
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                context,
                props: {
                    ...piece(testPiece)
                }
            });
            // const testEl = page.getByTestId(pieceTestId);
            // await expect.element(testEl).toBeInTheDocument();
            // expect(mountPiece).toHaveBeenCalled();
            // await delay();
            expect(mountPieceMock).toHaveBeenCalledOnce();
        });
        test("Should use the default mountPiece function if none is in context.", async () => {
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...piece(testPiece)
                }
            });
            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();
            expect(mountPiece).toHaveBeenCalledOnce();
        });
        test("Should mount the CollageJS piece given via the piece() function.", async () => {
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...piece(testPiece)
                }
            });
            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();
        });
        test("Should pass the specified props to the mounted piece.", async () => {
            const testProps = {
                foo: 'bar',
                count: 42
            };
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...testProps,
                    ...piece(testPiece)
                }
            });
            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();
            expect(testPieceCallbacks.mount).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining(testProps));
        });
        test("Should pass the new mountPiece function via props when mounting the piece.", async () => {
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...piece(testPiece)
                }
            });
            expect(testPieceCallbacks.mount).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({
                [mountPieceKey]: expect.any(Function)
            }));
        });
    });

    describe('Updating', () => {
        test("Should update the mounted piece when the props change (rerender).", async () => {
            // @ts-expect-error Seems like a TS bug in render()
            const { rerender } = render(Piece, {
                props: {
                    ...piece(testPiece),
                    foo: 'initial',
                    count: 1
                }
            });
            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();

            await rerender({
                ...piece(testPiece),
                foo: 'updated',
                count: 2
            });
            expect(testPieceCallbacks.update).toHaveBeenCalledWith(expect.objectContaining({
                foo: 'updated',
                count: 2
            }));
        });
        test("Should update the mounted piece when the props change (reactive).", async () => {
            const props = $state({
                ...piece(testPiece),
                foo: 'initial',
                count: 1
            });
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props
            });

            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();
            props.foo = 'updated';
            props.count = 2;
            flushSync();

            expect(testPieceCallbacks.update).toHaveBeenCalledWith(expect.objectContaining({
                foo: 'updated',
                count: 2
            }));
        });
    });

    describe('Unmounting', () => {
        test("Should unmount the mounted piece when the Piece component is unmounted.", async () => {
            // @ts-expect-error Seems like a TS bug in render()
            const { unmount } = render(Piece, {
                props: {
                    ...piece(testPiece)
                }
            });
            const testEl = page.getByTestId(pieceTestId);
            await expect.element(testEl).toBeInTheDocument();
            unmount();
            expect(testPieceCallbacks.unmount).toHaveBeenCalledOnce();
        });
        test("Should wait for mount() to finish before unmounting.", async () => {
            const callOrder: string[] = [];
            vi.mocked(testPieceCallbacks.mount).mockImplementation(() => {
                callOrder.push('mount');
                return () => {
                    callOrder.push('post-delay');
                };
            });
            vi.mocked(testPieceCallbacks.unmount).mockImplementation(() => {
                callOrder.push('unmount');
            });
            // @ts-expect-error Seems like a TS bug in render()
            const { unmount } = render(Piece, {
                props: {
                    ...piece(testPiece)
                }
            });
            // Intentionally not waiting for the piece to be mounted.
            unmount();
            await delay();
            expect(callOrder).toEqual(['mount', 'post-delay', 'unmount']);
        });
    });

    describe('Container Props', () => {
        test("Should pass the container props to the container DIV element.", async () => {
            const containerProps = {
                'data-testid': 'my-piece-container',
                class: 'piece-container-class'
            };
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...piece(testPiece, containerProps),
                }
            });
            const containerEl = page.getByTestId(containerProps['data-testid']);
            expect(containerEl).toHaveClass(containerProps.class);
        });
        test("Should update the container DIV element's props when they change (rerender).", async () => {
            const initialContainerProps = {
                'data-testid': 'my-piece-container',
                class: 'initial-class'
            };
            const updatedContainerProps = {
                'data-testid': 'my-piece-container',
                class: 'updated-class',
                title: 'Piece Container'
            };
            // @ts-expect-error Seems like a TS bug in render()
            const { rerender } = render(Piece, {
                props: {
                    ...piece(testPiece, initialContainerProps),
                }
            });
            const containerEl = page.getByTestId(initialContainerProps['data-testid']);
            expect(containerEl).toHaveClass(initialContainerProps.class);
            await rerender({
                ...piece(testPiece, updatedContainerProps),
            });
            expect(containerEl).toHaveClass(updatedContainerProps.class);
            expect(containerEl).toHaveAttribute('title', updatedContainerProps.title);
        });
        test("Should update the container DIV element's props when they change (reactive).", async () => {
            const containerProps = $state<HTMLAttributes<HTMLDivElement>>({
                'data-testid': 'my-piece-container',
                class: 'initial-class'
            });
            // @ts-expect-error Seems like a TS bug in render()
            render(Piece, {
                props: {
                    ...piece(testPiece, containerProps),
                }
            });
            const containerEl = page.getByTestId(containerProps['data-testid']);
            expect(containerEl).toHaveClass(containerProps.class as string);
            containerProps.class = 'updated-class';
            containerProps.title = 'Piece Container';
            flushSync();
            expect(containerEl).toHaveClass('updated-class');
            expect(containerEl).toHaveAttribute('title', 'Piece Container');
        });
    });
});
