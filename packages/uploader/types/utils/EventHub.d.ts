export declare class EventHub<K = keyof {}> {
    private _events;
    on<T extends K>(key: T, cb: EventHubCb): EventHub<K>;
    off(key: K, cb: EventHubCb): EventHub<K>;
    remove(key: K): EventHub<K>;
    once(key: K, cb: EventHubCb): EventHub<K>;
    emit(key: K, ...args: any[]): EventHub<K>;
    events(): Map<K, Set<EventHubCb<any>>>;
    asyncEmit(key: K, ...args: any[]): Promise<void>;
}
declare type EventHubCb<T = any> = (...args: T[]) => void;
export {};
//# sourceMappingURL=EventHub.d.ts.map