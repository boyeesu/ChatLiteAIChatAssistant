import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye, Trash2, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

export default function DocumentUploader() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  
  // Query documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete document: ${error}`,
        variant: 'destructive',
      });
    },
  });

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const supportedTypes = ['pdf', 'txt', 'docx', 'html'];
    
    // Check file type
    if (!supportedTypes.includes(fileType)) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload a PDF, TXT, DOCX, or HTML file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 50MB.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload document');
      }
      
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      toast({
        title: 'Document uploaded',
        description: 'The document has been successfully uploaded and indexed.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [queryClient, toast]);
  
  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/html': ['.html'],
    },
    maxFiles: 1,
    disabled: uploading,
  });
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  // Format file size
  const formatFileSize = (sizeKb: number) => {
    if (sizeKb < 1024) {
      return `${sizeKb.toFixed(1)} KB`;
    }
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  };
  
  // Handle delete document
  const handleDeleteDocument = (documentId: number) => {
    deleteDocumentMutation.mutate(documentId);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-all cursor-pointer ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag & drop files here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports PDF, TXT, DOCX, HTML (Max 50MB)
            </p>
            {uploading && (
              <div className="mt-2">
                <div className="animate-pulse bg-primary/20 h-1 mt-1 rounded-full">
                  <div className="bg-primary h-1 w-1/2 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Uploading and indexing...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Uploads */}
        <h3 className="text-sm font-medium mb-2">Recent Uploads</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-2 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-100 rounded w-32 mt-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {documents && documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.fileSizeKb)} · Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-500 hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deleteDocumentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-2">No documents uploaded yet.</p>
            )}
          </div>
        )}
        
        {documents && documents.length > 0 && (
          <Button variant="link" className="mt-4 text-primary text-sm font-medium p-0">
            View all documents
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
