# 執行時 API 範例

此頁面展示了 VitePress 提供的一些執行時 API 功能。

## `useData()`

`useData()` API 返回當前頁面的資料。您可以使用它來存取頁面特定的資訊。

```js
import { useData } from 'vitepress'

const { page, frontmatter, theme } = useData()
```

## `useRoute()`

`useRoute()` API 返回當前路由資訊。

```js
import { useRoute } from 'vitepress'

const route = useRoute()
```

## 更多

請查閱文件以獲取完整的執行時 API 列表。