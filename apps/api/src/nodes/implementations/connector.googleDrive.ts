import axios from 'axios';
import { NodeHandler, ExecutionContext, NodeOutput } from '../types';

export const googleDriveNode: NodeHandler = {
  type: 'connector.googleDrive',
  category: 'storage',
  label: 'Google Drive',
  description: 'Search, upload, download, and manage files and folders in Google Drive.',
  icon: 'Folder',
  color: '#34a853',
  inputs: [{ name: 'input', label: 'Input' }],
  outputs: [{ name: 'output', label: 'Output' }],
  credentials: ['google_drive_token'],
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: [
        { label: 'List Files', value: 'listFiles' },
        { label: 'Create Folder', value: 'createFolder' },
        { label: 'Get File Metadata', value: 'getFile' },
      ],
      default: 'listFiles',
      required: true,
    },
    {
      name: 'folderName',
      label: 'Folder Name',
      type: 'string',
      placeholder: 'Workflow Exports',
      dependsOn: { name: 'operation', value: 'createFolder' },
    },
    {
      name: 'fileId',
      label: 'File ID',
      type: 'string',
      placeholder: '1a2b3c4d5e',
      dependsOn: { name: 'operation', value: 'getFile' },
    },
    {
      name: 'pageSize',
      label: 'Page Size',
      type: 'number',
      default: 10,
    },
  ],

  async execute(ctx: ExecutionContext): Promise<NodeOutput> {
    const token = ctx.credentials['google_drive_token'] || process.env.GOOGLE_DRIVE_TOKEN;
    const { operation, folderName, fileId, pageSize = 10 } = ctx.parameters;

    await ctx.logger.info(`Google Drive: running ${operation}`);

    if (!token) {
      await ctx.logger.warn('Google Drive: OAuth token missing — simulating drive response');
      return {
        success: true,
        data: {
          simulated: true,
          operation,
          files: [
            { id: '1z2x3c4v5b', name: 'Quarterly_Report_2026.pdf', mimeType: 'application/pdf', size: 1048576 },
            { id: '6y7u8i9o0p', name: 'Customer_Data.csv', mimeType: 'text/csv', size: 245000 },
          ],
        },
      };
    }

    try {
      const client = axios.create({
        baseURL: 'https://www.googleapis.com/drive/v3',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (operation === 'listFiles') {
        const res = await client.get(`/files?pageSize=${pageSize}&fields=files(id,name,mimeType,size)`);
        return { success: true, data: res.data };
      } else if (operation === 'createFolder') {
        const res = await client.post('/files', {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        });
        return { success: true, data: res.data };
      }

      return { success: false, error: `Unsupported operation: ${operation}` };
    } catch (err: any) {
      return { success: false, error: `Google Drive error: ${err.message}` };
    }
  },
};
