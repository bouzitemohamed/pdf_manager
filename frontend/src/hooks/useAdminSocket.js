import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification, prependFile } from '../features/admin/adminSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

const useAdminSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    socketRef.current = io(SOCKET_URL, {
      query: { role: 'ADMIN' },
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[Socket] Admin connected:', socket.id);
    });

    // New file uploaded by any user
    socket.on('file:uploaded', (data) => {
      dispatch(addNotification({
        type: 'FILE_UPLOAD',
        message: `${data.user.email} uploaded "${data.file.name}" (${data.file.page_count} pages)`,
        data,
      }));
      dispatch(prependFile({
        ...data.file,
        user: data.user,
        createdAt: data.timestamp,
      }));
    });

    // File deleted
    socket.on('file:deleted', (data) => {
      dispatch(addNotification({
        type: 'FILE_DELETE',
        message: `${data.user.email} deleted "${data.fileName}"`,
        data,
      }));
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Admin disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);

  return socketRef.current;
};

export default useAdminSocket;
