import type { CorePiece, MountProps } from "@collagejs/core";
import { delay } from "./utils.ts";

export const pieceTestId = 'cjs-piece-test';

export function buildTestPiece<TProps extends Record<string, any> = Record<string, any>>(
    callbacks?: {
        mount: (target: HTMLElement, props?: MountProps<TProps>) => void | (() => void);
        unmount: () => void;
        update: (props: TProps) => void;
    }
): CorePiece<TProps> {
    let pre: HTMLElement;
    return {
        async mount(target: HTMLElement, props?: MountProps<TProps>) {
            const delayMountCb = callbacks?.mount?.(target, props);
            pre = document.createElement('pre');
            pre.setAttribute('data-testid', pieceTestId);
            pre.textContent = JSON.stringify(props, null, 2);
            target.appendChild(pre);
            if (delayMountCb) {
                await delay();
                delayMountCb();
            }
            return () => {
                callbacks?.unmount?.();
                target.removeChild(pre);
                return Promise.resolve();
            };
        },
        update(props: TProps) {
            callbacks?.update?.(props);
            pre.textContent = JSON.stringify(props, null, 2);
            return Promise.resolve();
        }
    } satisfies CorePiece<TProps>;
}
