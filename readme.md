## 2D JavaScript Portfolio Documentation

#### first create a local directory
mkdir rg-portfolio-2d

#### initialize a new vite project
cd rg-portfolio-2d && 
npm create vite@latest . 
 select vanilla > javascript 

#### install kaboom module
npm install kaboom

#### delete unnecessary files for this project
rm -rf main.js, style.css, /public/vite.svg, counter.js

### create vite file for updated frameworks
create a new file called `vite.config.js
  // vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/rg-portfolio-2d/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

#### create more files 
 create a new file called `main.js` in /src directory && update main.js to /src directory, 
 insert <style></style> <div></div> into index.html 
 create kaboomCtx.js in /src directory && import kaboom from "kaboom" with const k
 create constants.js 
 utils.js - makes everything cleaner

#### assests will be stored in public directory
  font type
  spritesheet
 also setup tile for game maping design, pretty neat. need to dive more into it

#### code to main.js 
  





