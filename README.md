# PSync
A pure Javascript implementation of some semaphores and mutexes.
This module aims to provide syncronization mechanisms for use in asynchronous or parallel applications.

# Future Goals
I'm currently working on a few new types including a deadlock checking mutex, and a recursive mutex. I would also like to add some nice FIFO queues.

# Documentation

* [Mutex](https://github.com/realdylanwebb/PSync#class-mutex)
* [Semaphore](https://github.com/realdylanwebb/PSync#class-semaphore)
* [Barrier](https://github.com/realdylanwebb/PSync#class-barrier)
* [CompletionEvent](https://github.com/realdylanwebb/PSync#class-completionevent)

## Class: Mutex
Async implementation of a mutex.
##### Example:
```javascript
let mutex = require("psync").Mutex();

async function example() {
  /* This will defer execution if the mutex is locked */
  await mutex.lock();
  /* Critical code section here */
  mutex.unlock();
}

async function trylockExample() {
  /*This is the same as before, except this will not defer execution 
  if the mutex is locked*/
  if (mutex.trylock() !== null) {
    /* Critical section here */
    mutex.unlock();
  }
}

```

### Mutex.tryLock()
Will attempt to aquire the lock. If the mutex is already locked, returns null. If the lock is aquired, returns a resolved promise.

### Mutex.lock()
Attempts to aquire the lock. If the mutex is already locked, returns a pending promise that will be resolved when the mutex is freed.

### Mutex.unlock()
Releases the lock and resolves the next waiting promise.

## Class: Semaphore
Async semaphore, set maxMembers = 1 for a binary semaphore.
##### Example:
```javascript
let semaphore = require("psync").Semaphore(5 /* Specify maxMembers here */);

async function example() {
  /* If the semaphore is in use maxMembers times, this will 
  defer execution until the semaphore is ready */
  await semaphore.wait();
  /* Critical section of code here */
  semaphore.post();
}
```

### Semaphore(maxMembers)
Creates a semaphore that can be aquired maxMembers times before defering execution.

### Semaphore.wait()
Reduces the semaphore count. If the count is 0, returns a pending promise that will be resolved when the semaphore is available again.

### Semaphore.post()
Increases the semaphore count. If there is a promise waiting, resolves the next waiting promise.

## Class: Barrier
Useful for when multiple tasks are happening at the same time, and they all need to be completed to proceed.
##### Example:
```javascript
let barrier = require("psync").Barrier(1 /*Specify number of signals required here*/);

async function example() {
  /* do something here */
  await barrier.signal();
  /*execution will be deferred until signal has been called
  the number of times specified*/
  console.log("done");
}
```


### Barrier(signalsRequired)
Constructor. Creates a barrier that will be released when Barrier.signal() is called signalsRequired times.

### Barrier.signal()
Signals that one task is completed to the barrier.
Returns a pending promise. The promise resolves when the barrier is complete.

## Class: CompletionEvent
A use once object that be used to defer execution until a signal is recieved.
##### Example
```javascript
let ce = require("psync").CompletionEvent()

async function example() {
  /* Will not proceed until ce.complete() is called somewhere else */
  await ce.wait();
  /* More code here */
}

async function example2() {
  /* Code that needs to be completed first */
  ce.complete();
  /* Now any pending waits will be resolved */
}
```

### CompletionEvent()
Constructor. The completion event can be waited upon by as many callees as necessary. Completing the completion event will continue execution for all callees.

### CompletionEvent.wait()
Returns a pending promise that will be resolved when CompletionEvent.complete() is called elsewhere.
If CompletionEvent.complete() has already been called, the promise will resolve immediately.

### CompletionEvent.complete()
Resolves all pending promises that have been returned by CompletionEvent.wait(). Does nothing if the event is
already complete.
