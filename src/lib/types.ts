import type { MountOptions, unmount } from "svelte";
import type { MountPiece } from "@collagejs/core";

/**
 * Options for Svelte's `mount()` function.
 */
export type SvelteMountOptions<
    TProps extends Record<string, any> = Record<string, any>
> = Omit<MountOptions<TProps>, 'target'>;

/**
 * Options given to the lifecycle-creation function.
 */
export type ComponentOperationOptions<
    TProps extends Record<string, any> = Record<string, any>
> = {
    /**
     * Optional function to be run immediately before Svelte mounts the component.
     * 
     * An error thrown from this function will make the mount promise to reject.
     * @param target HTML element where the Svelte component will be mounted in.
     */
    preMount?: (target: HTMLElement) => Promise<void> | void;
    /**
     * Optional function to be run immediately after Svelte unmounts the component.
     * 
     * An error thrown from this function will make the unmount promise to reject.
     * @param target HTML element where the Svelte component was mounted in.
     */
    postUnmount?: (target: HTMLElement) => Promise<void> | void;
    /**
     * Optional options for Svelte's `mount()` function.  Refer to Svelte's `mount()` function documentation for 
     * information about each option.
     */
    mount?: SvelteMountOptions<TProps>;
    /**
     * Optional options for Svelte's `unmount()` function.  Refer to Svelte's `unmount()` function documentation for
     * information about each option.
     */
    unmount?: Parameters<typeof unmount>[1];
};

export type CollageContext = {
    mountPiece: MountPiece;
}
