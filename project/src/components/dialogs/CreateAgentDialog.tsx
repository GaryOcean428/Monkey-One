import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAgentStore } from '@/store/agentStore';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAgentDialog({ open, onOpenChange }: CreateAgentDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const { createAgent } = useAgentStore();

  const handleSubmit = async () => {
    try {
      await createAgent({ name, type: type as any });
      onOpenChange(false);
      setName('');
      setType('');
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Configure a new agent with specific capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Name</label>
            <Input
              placeholder="Enter agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversational">Conversational Agent</SelectItem>
                <SelectItem value="scraper">Web Scraper</SelectItem>
                <SelectItem value="form_filler">Form Filler</SelectItem>
                <SelectItem value="coder">Code Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !type}>
            Create Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}