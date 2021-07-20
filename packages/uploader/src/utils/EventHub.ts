export class EventHub<K = keyof {}> {

  private _events = new Map<K, Set<EventHubCb<any>>>();

  on<T extends K>(key: T, cb: EventHubCb): EventHub<K> {
    if (!this._events.has(key)) {
      this._events.set(key, new Set);
    }
    this._events.get(key).add(cb);
    return this;
  }

  off(key: K, cb: EventHubCb): EventHub<K> {
    if (!this._events.has(key)) {
      return this;
    }

    this._events.get(key).delete(cb);

    return this;
  }

  remove(key: K): EventHub<K> {
    if (!this._events.has(key)) {
      return this;
    }
    this._events.get(key).forEach(cb => this.off(key, cb));
    this._events.delete(key);
  }

  once(key: K, cb: EventHubCb): EventHub<K> {
    if (!this._events.has(key)) {
      this._events.set(key, new Set);
    }
    const that = this;
    this._events.get(key).add(function t(...args) {
      cb(...args);
      that.off(key, t);
    });
    return this;
  }

  emit(key: K, ...args: any[]): EventHub<K> {
    if (!this._events.has(key)) {
      return this;
    }
    this._events.get(key).forEach(cb => cb(...args));
  }

  events() {
    return this._events;
  }

  async asyncEmit(key: K, ...args: any[]) {
    await Promise.resolve().then(()=>this.emit(key, ...args))
  }

}

type EventHubCb<T = any> = (...args: T[]) => void;
// TODO: 类型提示需要优化
