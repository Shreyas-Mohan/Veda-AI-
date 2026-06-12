'use client';
import { useEffect } from 'react';
import io from 'socket.io-client';
import { useAssignmentStore } from './useAssignmentStore';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

export const useSocket = () => {
  const { currentAssignmentId, setStatus } = useAssignmentStore();

  useEffect(() => {
    socket.on('status-update', (data) => {
      if (data.assignmentId === currentAssignmentId) {
        setStatus(data.status);
      }
    });

    return () => {
      socket.off('status-update');
    };
  }, [currentAssignmentId, setStatus]);

  return socket;
};
