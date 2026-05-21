import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Clock, MapPin, HelpCircle, User, CheckCircle, Trash2, Download, FileText, Upload } from 'lucide-react';
import { Announcement } from '../App';
import { apiService, ScheduleAttachment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AnnouncementCardProps {
  announcement: Announcement;
  onRefresh?: () => void;
}

export function AnnouncementCard({ announcement, onRefresh }: AnnouncementCardProps) {
  const { user } = useAuth();
  const [isResponding, setIsResponding] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attachments, setAttachments] = useState<ScheduleAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  // Проверка условий для отображения кнопки отмены
  const canCancelResponse = 
    user?.userType === 'HELPER' && 
    user?.userId && 
    announcement.responderId && 
    Number(announcement.responderId) === Number(user.userId) && 
    announcement.status !== 'COMPLETED' && 
    announcement.status !== 'CANCELLED';

  const isAdmin = user?.userType === 'ADMIN';

  useEffect(() => {
    setAttachments(announcement.attachments ?? []);
  }, [announcement.attachments]);

  const loadAttachments = async () => {
    if (!isAdmin) {
      return;
    }

    setAttachmentsLoading(true);
    setAttachmentError('');

    try {
      const data = await apiService.getScheduleAttachments(announcement.id);
      setAttachments(data);
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Ошибка загрузки файлов');
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!user || user.userType !== 'HELPER') {
      alert('Только помощники могут откликаться на объявления');
      return;
    }

    setIsResponding(true);
    setError('');

    try {
      await apiService.respondToSchedule(announcement.id);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отклике');
    } finally {
      setIsResponding(false);
    }
  };

  const handleCancelResponse = async () => {
    if (!user || user.userType !== 'HELPER') {
      return;
    }

    if (!confirm('Вы уверены, что хотите отменить свою заявку на помощь?')) {
      return;
    }

    setIsCanceling(true);
    setError('');

    try {
      await apiService.cancelResponse(announcement.id);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при отмене заявки');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.userType !== 'NEEDY') {
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await apiService.deleteSchedule(announcement.id);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении объявления');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttachmentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploadingAttachment(true);
    setAttachmentError('');

    try {
      const createdAttachment = await apiService.uploadScheduleAttachment(announcement.id, file);
      setAttachments((prev) => [createdAttachment, ...prev]);
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAttachmentOpen = async (attachmentId: number) => {
    setAttachmentError('');

    try {
      const { url } = await apiService.getScheduleAttachmentDownloadUrl(attachmentId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Ошибка получения ссылки на файл');
    }
  };

  const handleAttachmentDelete = async (attachmentId: number) => {
    if (!confirm('Удалить этот файл?')) {
      return;
    }

    setDeletingAttachmentId(attachmentId);
    setAttachmentError('');

    try {
      await apiService.deleteScheduleAttachment(attachmentId);
      setAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Ошибка удаления файла');
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleAttachmentSelectClick = () => {
    if (uploadingAttachment) {
      return;
    }

    attachmentInputRef.current?.click();
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    OPEN: 'Открыто',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Завершено',
    CANCELLED: 'Отменено',
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold">{announcement.author}</h3>
            {announcement.authorAge && (
              <p className="text-gray-500">{announcement.authorAge} лет</p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[announcement.status] || statusColors.OPEN}`}>
          {statusLabels[announcement.status] || announcement.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="text-gray-600 text-sm">Время</p>
            <p className="text-gray-900">{announcement.time}</p>
          </div>
        </div>

        {announcement.address && (
          <div className="flex items-start gap-3">
            <MapPin className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-gray-600 text-sm">Адрес</p>
              <p className="text-gray-900">{announcement.address}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <HelpCircle className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="text-gray-600 text-sm">Нужна помощь</p>
            <p className="text-gray-900">{announcement.helpNeeded}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {isAdmin && (
        <div className="mt-6 rounded-2xl border-2 border-gray-100 bg-gray-50 p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Файлы объявления</h4>
              <p className="text-sm text-gray-600">Только администратор может загружать, скачивать и удалять вложения.</p>
            </div>

            <button
              type="button"
              onClick={handleAttachmentSelectClick}
              disabled={uploadingAttachment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} />
              <span>{uploadingAttachment ? 'Загрузка...' : 'Загрузить файл'}</span>
            </button>
          </div>

          <input
            ref={attachmentInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            onChange={handleAttachmentUpload}
            disabled={uploadingAttachment}
          />

          <p className="mb-4 text-xs text-gray-500">
            Допустимые типы: JPG, PNG, PDF, TXT. Максимальный размер: 5 МБ.
          </p>

          {attachmentError && (
            <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {attachmentError}
            </div>
          )}

          {attachmentsLoading ? (
            <p className="text-sm text-gray-600">Загрузка файлов...</p>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-gray-600">Файлы пока не прикреплены.</p>
          ) : (
            <div className="grid gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2">
                      <FileText className="text-indigo-600" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{attachment.fileName}</p>
                      <p className="text-sm text-gray-600">
                        {(attachment.size / 1024).toFixed(1)} КБ · {new Date(attachment.uploadedAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row md:justify-self-end">
                    <button
                      type="button"
                      onClick={() => handleAttachmentOpen(attachment.id)}
                      className="inline-flex min-h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Download size={16} />
                      <span>Открыть</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttachmentDelete(attachment.id)}
                      disabled={deletingAttachmentId === attachment.id}
                      className="inline-flex min-h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span>{deletingAttachmentId === attachment.id ? 'Удаление...' : 'Удалить'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Кнопка отклика для помощника */}
      {announcement.status === 'OPEN' && user?.userType === 'HELPER' && !announcement.responderId && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleRespond}
            disabled={isResponding}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isResponding ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Откликаюсь...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Откликнуться на объявление</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Кнопка отмены заявки для помощника, который откликнулся */}
      {canCancelResponse && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleCancelResponse}
            disabled={isCanceling}
            style={{
              width: '100%',
              backgroundColor: '#a78bfa',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: isCanceling ? 'not-allowed' : 'pointer',
              opacity: isCanceling ? 0.5 : 1,
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isCanceling) {
                e.currentTarget.style.backgroundColor = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCanceling) {
                e.currentTarget.style.backgroundColor = '#a78bfa';
              }
            }}
          >
            {isCanceling ? 'Отменяю...' : 'Отменить свою заявку'}
          </button>
        </div>
      )}

      {/* Кнопка удаления для нуждающегося, который создал объявление */}
      {user?.userType === 'NEEDY' && announcement.ownerId === user.userId && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              width: '100%',
              backgroundColor: '#a78bfa',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1,
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#a78bfa';
              }
            }}
          >
            {isDeleting ? 'Удаляю...' : 'Удалить объявление'}
          </button>
        </div>
      )}

      {/* Информация о том, что кто-то откликнулся (если не текущий пользователь) */}
      {announcement.responderId && 
       user?.userId !== undefined && 
       Number(announcement.responderId) !== Number(user.userId) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            На это объявление уже откликнулись
          </p>
        </div>
      )}

    </div>
  );
}
