import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { increment, decrement, incrementByAmount, fetchCount } from '@/features/counter/counterSlice';

const Home = () => {

  const count = useSelector((state: RootState) => state.counter.value);
  const status = useSelector((state: RootState) => state.counter.status);
  // const error = useSelector((state: RootState) => state.counter.error);
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div>
      <h1>欢迎来到AI聊天应用</h1>
      <div>
      <h1>计数器: {count}</h1>
      <p>状态: {status}</p>
      <button onClick={() => dispatch(increment())}>加 1</button>
      <button onClick={() => dispatch(decrement())}>减 1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>加 5</button>
      <button
        onClick={() => dispatch(fetchCount(10))}
        disabled={status === 'loading'}
      >
        异步加 10
      </button>
    </div>
    </div>
  );
};
export default Home;