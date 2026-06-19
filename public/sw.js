var CACHE_NAME = "student-help-v2"

self.addEventListener("install", function () {
  self.skipWaiting()
})

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) { return caches.delete(key) })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", function () {})
