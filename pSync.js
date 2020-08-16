/* jshint esversion: 8 */
/* This guy above is for the linter just ignore it */

/*
*   Copyright (c) Dylan Webb 2020
*   This file and its contents are subject to the terms and conditions defined in the file 'LICENSE',
*   which is to be distributed with this source code or binary package. 
*   
*   A collection of simple mutexes and semaphores.
*/


class Semaphore {
    constructor(maxMembers) {
        this.count = maxMembers;
        this.waiting = [];
    }

    wait() {
        if (this.count) {
            this.count--;
        } else {
            return new Promise((resolve)=>{
                this.waiting.push(resolve);
            });
        }
    }

    post() {
        this.count++;
        if (this.waiting.length > 0) {
            let next = this.waiting.shift();
            this.count--;
            next();
        }
    }

}


class Mutex{
    /* All this does is wrap a binary semaphore and provide trylock as a convinience method 
       for checking the lock state before trying to contest the lock. */
    constructor() {
        this.sema = new Semaphore(1);
    }

    trylock() {
        if (this.sema.count) {
            return this.sema.wait();
        } else {
            return null;
        }
    }

    lock() {
        return this.sema.wait();
    }

    unlock() {
        this.sema.post();
    }
}


class MutexRecursive  {
    /* I was going to implement this one around the semaphore class as well,
       but this approach is much more lightweight. */
    constructor() {
        this.lock = 0;
        this.owner = null;
        this.waiting = [];
    }

    tryLock(promiseOrNull) {
        if (promiseOrNull === this.owner) {
            return this.lock(promiseOrNull);
        } else {
            return null;
        }
    }

    lock(promiseOrNull) {
        if(promiseOrNull === this.owner) {
            this.lock++;
            this.owner = new Promise((resolve)=> {
                resolve();
            })
            return this.owner;
        } else {
            return new Promise((resolve)=>{
                this.waiting.push(resolve);
            })
        }
    }

    unlock() {
        this.lock--;
        if (this.waiting.length) {
            this.owner = new Promise.resolve();
            let next = this.waiting.shift();
            next();
        } else {
            this.owner = null;
        }
    }
}


class Barrier {
    constructor(numMembers) {
        this.busy = numMembers;
        this.waiting = [];
    }

    signal() {
        this.busy--;
        if(!this.busy) {
            this.waiting.forEach(resolve => {
                    resolve();
            });
        } else {
            return new Promise((resolve)=>{
                this.waiting.push(resolve);
            });
        }
    }
}


class CompletionEvent {
    constructor() {
        this.waiting = [];
        this.complete = 0;
    }
    
    wait() {
        if (this.complete) {
            return new Promise((resolve)=>{
                resolve();
            })
        } else {
            return new Promise((resolve)=>{
                this.waiting.push(resolve);
            });
        }
    }

    complete() {
        this.waiting.forEach(resolve => {
            resolve();
        });
    }
}

module.exports = {Semaphore: Semaphore, Mutex: Mutex,
     Barrier: Barrier, CompletionEvent: CompletionEvent};
