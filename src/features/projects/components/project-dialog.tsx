'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project, ProjectStatus, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { EMPTY_PROJECT, PROJECT_STATUS_CONFIG } from '../constants';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateSubmit?: (payload: CreateProjectPayload) => void;
  onEditSubmit?: (payload: UpdateProjectPayload) => void;
  project?: Project | null;
  isLoading?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function ProjectDialog({
  open,
  onClose,
  onCreateSubmit,
  onEditSubmit,
  project,
  isLoading,
}: ProjectDialogProps) {
  const isEditing = !!project;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      if (project) {
        setTitle(project.title);
        setDescription(project.description);
        setStatus(project.status);
      } else {
        setTitle(EMPTY_PROJECT.title);
        setDescription(EMPTY_PROJECT.description);
        setStatus('draft');
      }
      setErrors({});
      setTouched(false);
    }
  }, [open, project]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length < 2) errs.title = 'Title must be at least 2 characters';
    if (!description.trim()) errs.description = 'Description is required';
    else if (description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (isEditing && project && onEditSubmit) {
      onEditSubmit({ id: project.id, title: title.trim(), description: description.trim(), status });
    } else if (onCreateSubmit) {
      onCreateSubmit({ title: title.trim(), description: description.trim() });
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (touched) {
      const errs = { ...errors };
      if (!val.trim()) errs.title = 'Title is required';
      else if (val.trim().length < 2) errs.title = 'Title must be at least 2 characters';
      else delete errs.title;
      setErrors(errs);
    }
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (touched) {
      const errs = { ...errors };
      if (!val.trim()) errs.description = 'Description is required';
      else if (val.trim().length < 10) errs.description = 'Description must be at least 10 characters';
      else delete errs.description;
      setErrors(errs);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your project details below.'
                : 'Give your film project a name and description to get started.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-title"
                placeholder="The Last Horizon"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                autoFocus
                required
                aria-invalid={!!errors.title}
                className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="project-description"
                placeholder="A brief description of your film project..."
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={3}
                required
                aria-invalid={!!errors.description}
                className={errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger id="project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

