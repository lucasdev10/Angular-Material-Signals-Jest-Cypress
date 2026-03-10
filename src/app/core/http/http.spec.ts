import { TestBed } from '@angular/core/testing';
import { MockDataService, STORAGE_MOCK } from '../data/mock-data.service';
import { HttpService } from './http';

interface TestItem {
  id?: string;
  name: string;
  value: number;
}

describe('HttpService', () => {
  let httpService: HttpService<TestItem>;
  let mockDataService: MockDataService;

  const testCollection = 'test-items';
  const mockItems: TestItem[] = [
    { id: 'item-1', name: 'Item 1', value: 100 },
    { id: 'item-2', name: 'Item 2', value: 200 },
    { id: 'item-3', name: 'Item 3', value: 300 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpService, MockDataService],
    });

    httpService = TestBed.inject(HttpService);
    mockDataService = TestBed.inject(MockDataService);

    // Clear storage before each test
    STORAGE_MOCK.clear();
  });

  describe('get', () => {
    it('should return collection data successfully', async () => {
      STORAGE_MOCK.set(testCollection, mockItems);

      return new Promise<void>((resolve, reject) => {
        httpService.get<TestItem[]>(testCollection).subscribe({
          next: (result) => {
            try {
              expect(result).toEqual(mockItems);
              expect(result.length).toBe(3);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should return 404 error for non-existent collection', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.get<TestItem[]>('non-existent').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Resource 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should simulate network delay', async () => {
      STORAGE_MOCK.set(testCollection, mockItems);
      const startTime = Date.now();

      return new Promise<void>((resolve, reject) => {
        httpService.get<TestItem[]>(testCollection).subscribe({
          next: () => {
            try {
              const endTime = Date.now();
              const duration = endTime - startTime;
              expect(duration).toBeGreaterThanOrEqual(500);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should handle empty collection', async () => {
      STORAGE_MOCK.set(testCollection, []);

      return new Promise<void>((resolve, reject) => {
        httpService.get<TestItem[]>(testCollection).subscribe({
          next: (result) => {
            try {
              expect(result).toEqual([]);
              expect(Array.isArray(result)).toBe(true);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      STORAGE_MOCK.set(testCollection, mockItems);
    });

    it('should return specific item by id', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.getById<TestItem>(testCollection, 'item-1').subscribe({
          next: (result) => {
            try {
              expect(result).toEqual(mockItems[0]);
              expect(result.id).toBe('item-1');
              expect(result.name).toBe('Item 1');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should return 404 error for non-existent item', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.getById<TestItem>(testCollection, 'non-existent').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Item with id 'non-existent' not found in 'test-items'");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should return 404 error for non-existent collection', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.getById<TestItem>('non-existent', 'item-1').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Collection 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should handle case-sensitive id matching', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.getById<TestItem>(testCollection, 'ITEM-1').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toContain('not found');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });
  });

  describe('post', () => {
    it('should add new item to collection', async () => {
      STORAGE_MOCK.set(testCollection, [...mockItems]);
      const newItem: TestItem = { name: 'New Item', value: 400 };

      return new Promise<void>((resolve, reject) => {
        httpService.post<TestItem>(testCollection, newItem).subscribe({
          next: (result) => {
            try {
              expect(result.name).toBe('New Item');
              expect(result.value).toBe(400);
              expect(result.id).toBeTruthy();
              expect(typeof result.id).toBe('string');

              // Verify item was added to storage
              const collection = STORAGE_MOCK.get(testCollection) as TestItem[];
              expect(collection.length).toBe(4);
              expect(collection.find((item) => item.id === result.id)).toBeTruthy();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should preserve existing id if provided', async () => {
      STORAGE_MOCK.set(testCollection, [...mockItems]);
      const newItem: TestItem = { id: 'custom-id', name: 'Custom Item', value: 500 };

      return new Promise<void>((resolve, reject) => {
        httpService.post<TestItem>(testCollection, newItem).subscribe({
          next: (result) => {
            try {
              expect(result.id).toBe('custom-id');
              expect(result.name).toBe('Custom Item');

              // Verify item was added to storage
              const collection = STORAGE_MOCK.get(testCollection) as TestItem[];
              expect(collection.find((item) => item.id === 'custom-id')).toBeTruthy();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should create collection if it does not exist', async () => {
      const newItem: TestItem = { name: 'First Item', value: 100 };

      return new Promise<void>((resolve, reject) => {
        httpService.post<TestItem>('new-collection', newItem).subscribe({
          next: (result) => {
            try {
              expect(result.name).toBe('First Item');
              expect(result.id).toBeTruthy();

              // Verify collection was created
              const collection = STORAGE_MOCK.get('new-collection') as TestItem[];
              expect(collection).toBeTruthy();
              expect(collection.length).toBe(1);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should generate unique ids for multiple items', async () => {
      STORAGE_MOCK.set(testCollection, []);
      const item1: TestItem = { name: 'Item 1', value: 100 };
      const item2: TestItem = { name: 'Item 2', value: 200 };

      return new Promise<void>((resolve, reject) => {
        httpService.post<TestItem>(testCollection, item1).subscribe({
          next: (result1) => {
            httpService.post<TestItem>(testCollection, item2).subscribe({
              next: (result2) => {
                try {
                  expect(result1.id).toBeTruthy();
                  expect(result2.id).toBeTruthy();
                  expect(result1.id).not.toBe(result2.id);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              error: reject,
            });
          },
          error: reject,
        });
      });
    });
  });

  describe('put', () => {
    beforeEach(() => {
      STORAGE_MOCK.set(testCollection, [...mockItems]);
    });

    it('should update existing item', async () => {
      const updateData: Partial<TestItem> = { name: 'Updated Item', value: 999 };

      return new Promise<void>((resolve, reject) => {
        httpService.put<TestItem>(testCollection, 'item-1', updateData as TestItem).subscribe({
          next: (result) => {
            try {
              expect(result.id).toBe('item-1');
              expect(result.name).toBe('Updated Item');
              expect(result.value).toBe(999);

              // Verify item was updated in storage
              const collection = STORAGE_MOCK.get(testCollection) as TestItem[];
              const updatedItem = collection.find((item) => item.id === 'item-1');
              expect(updatedItem?.name).toBe('Updated Item');
              expect(updatedItem?.value).toBe(999);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should preserve id when updating', async () => {
      const updateData: TestItem = { id: 'different-id', name: 'Updated', value: 500 };

      return new Promise<void>((resolve, reject) => {
        httpService.put<TestItem>(testCollection, 'item-1', updateData).subscribe({
          next: (result) => {
            try {
              expect(result.id).toBe('item-1'); // Should preserve original id
              expect(result.name).toBe('Updated');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should return 404 error for non-existent item', async () => {
      const updateData: TestItem = { name: 'Updated', value: 500 };

      return new Promise<void>((resolve, reject) => {
        httpService.put<TestItem>(testCollection, 'non-existent', updateData).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Item with id 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should return 404 error for non-existent collection', async () => {
      const updateData: TestItem = { name: 'Updated', value: 500 };

      return new Promise<void>((resolve, reject) => {
        httpService.put<TestItem>('non-existent', 'item-1', updateData).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Collection 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should merge update data with existing item', async () => {
      const updateData: Partial<TestItem> = { name: 'Updated Name Only' };

      return new Promise<void>((resolve, reject) => {
        httpService.put<TestItem>(testCollection, 'item-1', updateData as TestItem).subscribe({
          next: (result) => {
            try {
              expect(result.id).toBe('item-1');
              expect(result.name).toBe('Updated Name Only');
              expect(result.value).toBe(100); // Should preserve original value
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      STORAGE_MOCK.set(testCollection, [...mockItems]);
    });

    it('should delete existing item', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.delete(testCollection, 'item-1').subscribe({
          next: (result) => {
            try {
              expect(result).toBeUndefined();

              // Verify item was removed from storage
              const collection = STORAGE_MOCK.get(testCollection) as TestItem[];
              expect(collection.length).toBe(2);
              expect(collection.find((item) => item.id === 'item-1')).toBeUndefined();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should return 404 error for non-existent item', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.delete(testCollection, 'non-existent').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Item with id 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should return 404 error for non-existent collection', async () => {
      return new Promise<void>((resolve, reject) => {
        httpService.delete('non-existent', 'item-1').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Collection 'non-existent' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should not affect other items when deleting', async () => {
      const originalLength = mockItems.length;

      return new Promise<void>((resolve, reject) => {
        httpService.delete(testCollection, 'item-2').subscribe({
          next: () => {
            try {
              const collection = STORAGE_MOCK.get(testCollection) as TestItem[];
              expect(collection.length).toBe(originalLength - 1);
              expect(collection.find((item) => item.id === 'item-1')).toBeTruthy();
              expect(collection.find((item) => item.id === 'item-3')).toBeTruthy();
              expect(collection.find((item) => item.id === 'item-2')).toBeUndefined();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should handle deleting from empty collection', async () => {
      STORAGE_MOCK.set('empty-collection', []);

      return new Promise<void>((resolve, reject) => {
        httpService.delete('empty-collection', 'any-id').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              expect(error.message).toBe("Item with id 'any-id' not found");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle null collection gracefully', async () => {
      STORAGE_MOCK.set(testCollection, null as any);

      return new Promise<void>((resolve, reject) => {
        httpService.get<TestItem[]>(testCollection).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should handle undefined collection gracefully', async () => {
      // Don't set anything in storage

      return new Promise<void>((resolve, reject) => {
        httpService.getById<TestItem>(testCollection, 'item-1').subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.status).toBe(404);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should maintain data integrity across operations', async () => {
      STORAGE_MOCK.set(testCollection, [...mockItems]);

      return new Promise<void>((resolve, reject) => {
        // Add item
        httpService.post<TestItem>(testCollection, { name: 'New', value: 400 }).subscribe({
          next: (newItem) => {
            // Update item
            httpService
              .put<TestItem>(testCollection, newItem.id!, { name: 'Updated', value: 500 })
              .subscribe({
                next: (updatedItem) => {
                  // Get item
                  httpService.getById<TestItem>(testCollection, updatedItem.id!).subscribe({
                    next: (retrievedItem) => {
                      try {
                        expect(retrievedItem.name).toBe('Updated');
                        expect(retrievedItem.value).toBe(500);

                        // Delete item
                        httpService.delete(testCollection, retrievedItem.id!).subscribe({
                          next: () => {
                            // Verify deletion
                            httpService
                              .getById<TestItem>(testCollection, retrievedItem.id!)
                              .subscribe({
                                next: () => reject(new Error('Item should have been deleted')),
                                error: () => resolve(), // Expected error
                              });
                          },
                          error: reject,
                        });
                      } catch (error) {
                        reject(error);
                      }
                    },
                    error: reject,
                  });
                },
                error: reject,
              });
          },
          error: reject,
        });
      });
    });
  });
});
