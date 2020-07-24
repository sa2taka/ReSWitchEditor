<template>
  <div class="app">
    <canvas id="editor-canvas" class=""></canvas>
    <div class="button-area">
      <span style="margin-right: 4px">1行あたり2小節</span>
      <input
        id="toggle"
        class="toggle-input switch"
        type="checkbox"
        @change="handleExpandedSwitch"
      />
      <label for="toggle" class="toggle-label switch" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { CanvasApp } from './canvasApp';

export default defineComponent({
  name: 'App',
  setup() {
    let app: CanvasApp;
    const handleExpandedSwitch = (event: Event) => {
      app.setExpandedLine((event.target! as any).checked);
    };
    onMounted(() => {
      const canvas = document.getElementById(
        'editor-canvas'
      ) as HTMLCanvasElement;
      app = new CanvasApp(canvas);
      const setCanvasSize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (canvas) {
          canvas.setAttribute('width', width + 'px');
          canvas.setAttribute('height', height - 64 + 'px');
        }
        app.draw();
      };

      setCanvasSize();
      window.addEventListener('resize', setCanvasSize);
      app.draw();
    });

    return {
      handleExpandedSwitch,
    };
  },
});
</script>

<style lang="scss">
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #1c2e40;
  color: #eeeeee;
}

#app {
  width: 100%;
  height: 100%;
}

.button-area {
  margin: 0 64px;
  display: flex;
}

label.switch {
  width: 52px;
  height: 28px;
  background: #ccc;
  position: relative;
  display: inline-block;
  border-radius: 46px;
  transition: 0.4s;
  box-sizing: border-box;
  &:after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 100%;
    left: 2px;
    top: 2px;
    z-index: 2;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    transition: 0.2s ease-in-out;
  }
}

input.switch {
  display: none;
}

input:checked {
  + label.switch {
    background-color: #4bd865;
    &:after {
      left: 26px;
    }
  }
}

.toggle-switch {
  position: relative;
  width: 75px;
  height: 42px;
  margin: auto;
}
</style>
