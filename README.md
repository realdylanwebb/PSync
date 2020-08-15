# PSync
A pure Javascript implementation of some semaphores and mutexes.
This module aims to provide syncronization mechanisms for use in asynchronous or parallel applications, similar to the ones provided by the POSIX interface or the C++ Standard Library.

# Documentation

* Mutex
* CountSemaphore
* Barrier

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

## Class: CountSemaphore
Async semaphore, set maxMembers = 1 for a binary semaphore.
##### Example:
```javascript
let semaphore = require("psync").CountSemaphore(5 /* Specify maxMembers here */);

async function example() {
  /* If the semaphore is in use maxMembers times, this will 
  defer execution until the semaphore is ready */
  await semaphore.semWait();
  /* Critical section of code here */
  semaphore.semPost();
}
```

### CountSemaphore(maxMembers)
Creates a semaphore that can be aquired maxMembers times before defering execution.

### CountSemaphore.semWait()
Reduces the semaphore count. If the count is 0, returns a pending promise that will be resolved when the semaphore is available again.

### CountSemaphore.semPost()
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
