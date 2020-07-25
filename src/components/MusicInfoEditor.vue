<template>
  <div class="music-info">
    <div class="input-box">
      <div class="input-string">
        <input
          id="name"
          placeholder=" "
          :value="state.info.name"
          @input="handleName"
        />
        <div class="label">曲名</div>
      </div>
    </div>

    <div class="flex-row">
      <div class="input-box">
        <div class="input-string">
          <input
            id="BPM"
            placeholder=" "
            type="number"
            :value="state.info.bpm"
            @input="handleBpm"
          />
          <div class="label">BPM</div>
        </div>
      </div>

      <div class="input-file-box">
        <div class="input-file">
          <div class="file-input-label">
            音声ファイル{{
              state.info.musicFile !== '' ? `(${state.info.musicFile})` : ''
            }}
          </div>
          <input
            id="music-file"
            placeholder=" "
            type="file"
            @input="handleMusicFile"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from 'vue';
import { MusicInfo } from '../types';

type Prop = {
  value: MusicInfo;
};

export default defineComponent({
  name: 'MusicInfoEditor',
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  setup(props: Prop, context: SetupContext) {
    const state = reactive<{ info: MusicInfo }>({ info: props.value });
    const handleName = (event: Event) => {
      state.info.name = (event.target as HTMLInputElement).value;
      context.emit('input', state.info);
    };

    const handleBpm = (event: Event) => {
      state.info.bpm = parseInt((event.target as HTMLInputElement).value);
      context.emit('input', state.info);
    };

    const handleMusicFile = (event: Event) => {
      state.info.musicFile = (event.target as HTMLInputElement).files![0].path;
      context.emit('input', state.info);
    };
    return { state, handleName, handleBpm, handleMusicFile };
  },
});
</script>

<style lang="scss" scoped>
.music-info {
  display: flex;
  flex-flow: column;
  width: 640px;
  height: 480px;
  background-color: #2c3e50;
  padding: 32px;
  border-radius: 12px;
}

.input-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid lightgray;
  margin-top: 32px;
}

.input-string {
  width: 100%;
  height: 100%;
  background-color: transparent;
  position: relative;
}

.label {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-size: 16px;
  line-height: 50px;
  background-color: transparent;
  color: #80868b;
  box-sizing: border-box;
  transition: all 0.2s;
  text-align: left;
  margin-left: 8px;
}

.input-string > input {
  position: absolute;
  z-index: 1;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border: none;
  outline: none;
  padding: 0 10px;
  font-size: 16px;
  background-color: transparent;
  box-sizing: border-box;
  color: white;
  font-weight: 600;

  &:focus + .label {
    color: white;
    font-size: 0.9em;
    line-height: 10px;
    width: 120px;
    height: 10px;
    padding: 0 2px;
    transform: translate3d(-4px, -14px, 0);
  }

  &:not(:placeholder-shown) + .label {
    color: white;
    font-size: 0.9em;
    line-height: 10px;
    width: 120px;
    height: 10px;
    padding: 0 2px;
    transform: translate3d(-4px, -14px, 0);
  }
}

.flex-row {
  display: flex;
  align-items: center;
}

.input-file-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  margin-top: 32px;
}

.input-file {
  margin-left: 24px;
  width: 100%;
  height: 100%;
  background-color: transparent;
  position: relative;
  display: flex;
  flex-flow: column;
}

.file-input-label {
  text-align: left;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
