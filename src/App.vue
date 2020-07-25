<template>
  <div class="app">
    <canvas id="editor-canvas" class=""></canvas>
    <div class="button-area">
      <div class="switch-content">
        <span style="margin-right: 4px">1行あたり2小節</span>
        <input
          id="toggle"
          class="toggle-input switch"
          type="checkbox"
          @change="handleExpandedSwitch"
        />
        <label for="toggle" class="toggle-label switch" />
      </div>

      <button class="btn end" @click="handleEditButtonClick">
        楽曲情報を編集する
      </button>
    </div>
    <teleport to="#modal-target">
      <div v-if="isModalVisible" class="modal" @click="handleModalOutClick">
        <div id="modal-content" class="modal-content">
          <music-info-editor :value="state.info" @input="handleMusicInfo" />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { CanvasApp } from './canvasApp';
import MusicInfoEditor from './components/MusicInfoEditor.vue';
import { MusicInfo } from './types';
import { Audio } from './libs/audio';

type MusicState = {
  now: number;
};

export default defineComponent({
  name: 'App',
  components: {
    MusicInfoEditor,
  },
  setup() {
    const infoItem = localStorage.getItem('info');
    const audio = new Audio();

    const state = reactive<{ info: MusicInfo }>({
      info: infoItem
        ? JSON.parse(infoItem)
        : { name: '', bpm: 120, musicFile: '' },
    });
    const audioState = reactive<MusicState>({
      now: 0,
    });

    if (state.info.musicFile !== '') {
      audio.loadFile(state.info.musicFile!);
    }

    const handleMusicInfo = (value: MusicInfo) => {
      if (
        value.name !== undefined &&
        value.bpm !== undefined &&
        value.musicFile !== undefined
      ) {
        state.info = value;
        audio.loadFile(state.info.musicFile!);
        localStorage.setItem('info', JSON.stringify(value));
      }
    };

    const isModalVisible = ref(false);

    const handleEditButtonClick = () => {
      isModalVisible.value = !isModalVisible.value;
    };

    const handleModalOutClick = (event: Event) => {
      const target = event.target as Element;
      if (!target.closest('#modal-content')) {
        isModalVisible.value = false;
      }
    };

    let app: CanvasApp;

    const handleExpandedSwitch = (event: Event) => {
      app.setExpandedLine((event.target! as any).checked);
    };

    window.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.keyCode === 32) {
        if (audio.isPlaying) {
          audio.pause();
          audioState.now = audio.context.currentTime;
        } else {
          if (audio.source && !(audio.context.state === 'running')) {
            audio.resume();
          } else {
            audio.play();
          }
        }
      }
    });

    onMounted(() => {
      const canvas = document.getElementById(
        'editor-canvas'
      ) as HTMLCanvasElement;
      app = new CanvasApp(canvas, audio);
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
      isModalVisible,
      state,
      handleMusicInfo,
      handleModalOutClick,
      handleEditButtonClick,
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

.modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: #0007;
}

.modal-content {
  left: 50%;
  padding: 40px;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
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

.switch-content {
  display: flex;
  align-items: center;
}

.btn {
  min-width: 100px;
  font-family: inherit;
  appearance: none;
  border: 0;
  border-radius: 5px;
  background: #006956;
  color: #fff;
  padding: 8px 16px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
}

.btn:hover {
  background: #107966;
}

.btn:focus {
  outline: none;
}

.end {
  margin-left: auto;
  margin-right: 64px;
}
</style>
