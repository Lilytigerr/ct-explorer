import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

（刪掉 `base: '/ct-explorer/'` 這行）

**⑤ Commit changes**

Vercel 會自動偵測到 GitHub 有更新，**自動重新部署**，等 1-2 分鐘後打開：
```
https://ct-explorer.vercel.app
