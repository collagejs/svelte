import { contextKey } from "$lib/collageContext.js";
import type { ComponentOperationOptions } from "$lib/types.js";
import { type CorePiece, mountPieceKey, type MountProps } from "@collagejs/core";
import { mount, unmount, type Component } from "svelte";

/**
 * Class used to track instances.
 */
class SveltePiece<TProps extends Record<string, any> = Record<string, any>> {
    props = $state({} as TProps);
    target?: HTMLElement;
    instance?: Object;
}

/**
 * Creates a `buildPiece` function for Svelte v5 components.
 * @param mountFn Svelte's mount() function (or a substitute).
 * @param unmountFn Svelte's unmount() function (or a substitute).
 * @returns A `buildPiece` function that uses the given mounting and unmounting functions.
 */
export function buildPieceFactory(
    mountFn = mount,
    unmountFn = unmount
) {
    return function <TProps extends Record<string, any> = Record<string, any>>(
        component: Component<TProps>,
        options?: ComponentOperationOptions<TProps>
    ) {
        if (!component) {
            throw new Error('No component was given to the function.');
        }
        if ((options?.mount as any)?.target) {
            console.warn("Specifying the 'target' mount option has no effect.");
        }
        const thisValue = new SveltePiece<TProps>();

        async function mountComponent(this: SveltePiece<TProps>, target: HTMLElement, props?: MountProps<TProps>) {
            this.target = target;
            await options?.preMount?.(this.target);
            // Don't lose any potential incoming context.
            let context = options?.mount?.context ?? new Map();
            context.set(contextKey, {
                mountPiece: props?.[mountPieceKey]
            });
            delete props?.[mountPieceKey];
            const mergedProps = {
                ...options?.mount?.props,
                ...props
            } as TProps;
            for (let key in mergedProps) {
                this.props[key] = mergedProps[key];
            }
            this.instance = mountFn(component, {
                ...options?.mount,
                context,
                target: this.target,
                props: this.props
            });
            return async () => {
                if (!this.instance) {
                    throw new Error('Cannot unmount:  There is no component to unmount.');
                }
                await unmountFn(this.instance, options?.unmount);
                await options?.postUnmount?.(this.target!);
                this.instance = undefined;
                this.target = undefined;
                this.props = {} as TProps;
            };
        }

        function updateComponent(this: SveltePiece<TProps>, newProps: TProps) {
            if (!this.instance) {
                return Promise.reject(new Error('Cannot update:  No component has been mounted.'));
            }
            for (let key in newProps) {
                this.props[key] = newProps[key];
            }
            // TODO: Perhaps we need await tick() here?
            return Promise.resolve();
        }

        return {
            mount: mountComponent.bind(thisValue),
            update: updateComponent.bind(thisValue)
        } satisfies CorePiece<TProps>;
    }
}
