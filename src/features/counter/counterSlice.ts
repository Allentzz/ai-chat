import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';

// 更新状态接口
interface CounterState {
  value: number;
  status?: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
};


const counterSlice = createSlice({
  name: 'counter', // slice 的名称
  initialState,
  // 同步操作
  reducers: {
    increment: (state) => {
      state.value += 1; // 直接修改状态（内部使用 Immer）
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
  // 异步操作
  extraReducers: (builder) => {
    // 异步操作的状态
    builder
      .addCase(fetchCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'succeeded';
        state.value += action.payload;
      })
      .addCase(fetchCount.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

// 模拟异步 API 调用
export const fetchCount = createAsyncThunk(
  'counter/fetchCount',
  async (amount: number) => {
    const response = await new Promise<{ data: number }>((resolve) =>
      setTimeout(() => resolve({ data: amount }), 1000)
    );
    return response.data;
  }
);

// 导出 action 创建器
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 导出 reducer
export default counterSlice.reducer;