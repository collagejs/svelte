import type { AcceptableTarget, CorePiece, CorePieceCapabilities, MountProps, RelocateFn } from "@collagejs/core";
import { delay } from "./utils.ts";

export const pieceTestId = 'cjs-piece-test';

export function buildTestPiece<
    TProps extends Record<string, any> = Record<string, any>,
    TCap extends Record<string, any> = {}
>(
    callbacks?: {
        mount: (target: AcceptableTarget, props?: MountProps<TProps>) => void | (() => void);
        unmount: () => void;
        update: (props: TProps) => void;
    },
    capabilities?: CorePieceCapabilities & TCap,
    relocateFn?: RelocateFn
): CorePiece<TProps, TCap> {
    let pre: HTMLElement;
    return {
        async mount(target: AcceptableTarget, props?: MountProps<TProps>) {
            const delayMountCb = callbacks?.mount?.(target, props);
            pre = document.createElement('pre');
            pre.setAttribute('data-testid', pieceTestId);
            pre.textContent = JSON.stringify(props, null, 2);
            target.appendChild(pre);
            if (delayMountCb) {
                await delay();
                delayMountCb();
            }
            const capturedPre = pre;
            return () => {
                callbacks?.unmount?.();
                capturedPre.remove();
                return Promise.resolve();
            };
        },
        update(props: TProps) {
            callbacks?.update?.(props);
            pre.textContent = JSON.stringify(props, null, 2);
            return Promise.resolve();
        },
        relocate: relocateFn ?? (() => Promise.resolve('supported')),
        get capabilities() {
            return capabilities;
        }
    } satisfies CorePiece<TProps, TCap>;
}
