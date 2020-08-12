/* jshint esversion: 8 */
/* This guy above is for the linter just ignore it */

/*
*   Copyright (C) Dylan Webb 2020
*   This file and it's contents are subject to the terms and conditions defined in the file 'LICENSE',
*   which is to be distributed with this source code or binary package. 
*   
*   A collection of simple mutexes and semaphores inspired by POSIX. 
*   Namely the pthread_mutex interface, and POSIX semaphores.
*/


class CountSemaphore {
    constructor(maxMembers) {
        this.count = maxMembers;
        this.waiting = [];
    }

    semWait() {
        if (this.count) {
            console.log(this.count);
            console.log("LOCK FREE");
            this.count--;
        } else {
            console.log(this.count);
            console.log("LOCK CONTENDED");
            return new Promise((resolve)=>{
                this.waiting.push(resolve);
            });
        }
    }

    semPost() {
        console.log("FREEING LOCK");
        this.count++;
        if (this.waiting.length > 0) {
            let next = this.waiting.pop();
            this.count--;
            next();
        }
        console.log(this.count);
    }

}


class Mutex{
    /* All this does is wrap a binary semaphore and provide trylock as a convinience method 
       for checking the lock state before trying to contest the lock. */
    constructor() {
        this.sema = new CountSemaphore(1);
    }

    trylock() {
        if (this.sema.count) {
            return this.sema.semWait();
        } else {
            return null;
        }
    }

    lock() {
        return this.sema.semWait();
    }

    unlock() {
        this.sema.semPost();
    }
}


class MutexRecursive{
    
}


module.exports = {CountSemaphore: CountSemaphore, Mutex: Mutex, MutexRecursive: MutexRecursive};