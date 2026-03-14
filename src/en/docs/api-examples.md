# Runtime API Examples

This page demonstrates some of the runtime API features provided by VitePress.

## `useData()`

The `useData()` API returns the current page's data. You can use it to access page-specific information.

```js
import { useData } from 'vitepress'

const { page, frontmatter, theme } = useData()
```

## `useRoute()`

The `useRoute()` API returns the current route information.

```js
import { useRoute } from 'vitepress'

const route = useRoute()
```

## More

Check out the documentation for the full list of runtime APIs.