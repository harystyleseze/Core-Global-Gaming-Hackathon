from dataclasses import dataclass
from typing import List, Tuple, Dict, Set
from collections import deque
import math

@dataclass
class LevelConfig:
    num_keys: int
    num_asteroids: int
    num_teleporters: int
    grid_size: Tuple[int, int]
    difficulty_multiplier: float

class PathValidator:
    @staticmethod
    def is_valid_move(x: int, y: int, grid: List[List[int]], grid_size: Tuple[int, int]) -> bool:
        """Check if a position is valid and not blocked"""
        width, height = grid_size
        return (0 <= x < width and 
                0 <= y < height and 
                grid[y][x] != 4)  # 4 is asteroid
    
    @staticmethod
    def get_neighbors(x: int, y: int, grid: List[List[int]], 
                     grid_size: Tuple[int, int], 
                     teleporters: Dict[Tuple[int, int], Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Get all possible moves from current position"""
        moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # Up, Right, Down, Left
        neighbors = []
        
        # Normal moves
        for dx, dy in moves:
            new_x, new_y = x + dx, y + dy
            if PathValidator.is_valid_move(new_x, new_y, grid, grid_size):
                neighbors.append((new_x, new_y))
        
        # Teleporter moves
        if (x, y) in teleporters:
            neighbors.append(teleporters[(x, y)])
        
        return neighbors
    
    @staticmethod
    def find_path_to_keys(start: Tuple[int, int], 
                         keys: List[Tuple[int, int]], 
                         grid: List[List[int]],
                         grid_size: Tuple[int, int],
                         teleporters: Dict[Tuple[int, int], Tuple[int, int]]) -> bool:
        """Check if all keys are reachable"""
        keys_set = set(keys)
        visited = set()
        queue = deque([(start, set())])
        
        while queue:
            pos, collected = queue.popleft()
            if pos in visited:
                continue
                
            visited.add(pos)
            if pos in keys_set:
                collected = collected | {pos}
                if len(collected) == len(keys_set):
                    return True
            
            for next_pos in PathValidator.get_neighbors(*pos, grid, grid_size, teleporters):
                if next_pos not in visited:
                    queue.append((next_pos, collected))
        
        return False
    
    @staticmethod
    def validate_level(grid: List[List[int]], 
                      keys: List[Tuple[int, int]], 
                      portal: Tuple[int, int],
                      teleporters: Dict[Tuple[int, int], Tuple[int, int]],
                      grid_size: Tuple[int, int]) -> bool:
        """Validate that the level is solvable"""
        start = (0, 2)  # Starting position
        
        # Check if all keys are reachable
        if not PathValidator.find_path_to_keys(start, keys, grid, grid_size, teleporters):
            return False
        
        # Check if portal is reachable after collecting all keys
        # For this check, remove barriers since all keys are collected
        portal_grid = [row[:] for row in grid]
        for y in range(len(portal_grid)):
            for x in range(len(portal_grid[y])):
                if portal_grid[y][x] == 5:  # 5 is barrier
                    portal_grid[y][x] = 0
        
        # Check path to portal from any position (since we might collect last key anywhere)
        for y in range(grid_size[1]):
            for x in range(grid_size[0]):
                if PathValidator.is_valid_move(x, y, portal_grid, grid_size):
                    if PathValidator.find_path_to_keys((x, y), [portal], portal_grid, grid_size, teleporters):
                        return True
        
        return False

class GameState:
    def __init__(self):
        self.score = 0
        self.level = 1
        self.keys_collected = 0
        self.high_score = 0
        self.total_keys = 0  # Total keys across all levels
        self.game_over = False
        self.path_validator = PathValidator()
        self._calculate_difficulty()
    
    def _calculate_difficulty(self) -> LevelConfig:
        """Calculate level difficulty based on current level"""
        # Base difficulty increases with level
        base_difficulty = math.log(self.level + 1, 2)
        
        # Calculate number of objects based on level progression
        num_keys = min(round(2 + base_difficulty), 8)  # Max 8 keys
        num_asteroids = min(round(3 + base_difficulty * 1.5), 12)  # Max 12 asteroids
        num_teleporters = min(max(0, round(base_difficulty - 1)), 3)  # Max 3 teleporter pairs
        
        # Difficulty multiplier affects scoring
        difficulty_multiplier = 1.0 + (base_difficulty * 0.2)
        
        return LevelConfig(
            num_keys=num_keys,
            num_asteroids=num_asteroids,
            num_teleporters=num_teleporters,
            grid_size=(6, 5),  # Current grid size
            difficulty_multiplier=difficulty_multiplier
        )
    
    def get_level_config(self) -> LevelConfig:
        """Get the configuration for the current level"""
        return self._calculate_difficulty()
    
    def complete_level(self) -> int:
        """Complete current level and calculate score"""
        config = self._calculate_difficulty()
        level_score = round(100 * self.level * config.difficulty_multiplier)
        self.score += level_score
        self.level += 1
        
        # Keys are now persistent between levels
        self.total_keys += self.keys_collected
        self.keys_collected = 0
        
        if self.score > self.high_score:
            self.high_score = self.score
        
        return level_score
    
    def reset_game(self):
        """Reset game state but maintain high score"""
        self.score = 0
        self.level = 1
        self.keys_collected = 0
        self.total_keys = 0
        self.game_over = False
        self._calculate_difficulty()
    
    def collect_key(self):
        """Handle key collection"""
        self.keys_collected += 1
        self.total_keys += 1
    
    def use_key(self):
        """Handle key usage"""
        if self.total_keys > 0:
            self.total_keys -= 1
            return True
        self.game_over = True
        return False
    
    def get_total_keys(self) -> int:
        """Get total available keys"""
        return self.total_keys

class MemoryManager:
    def __init__(self):
        self.object_pool = {
            'keys': [],
            'barriers': [],
            'asteroids': [],
            'teleporters': []
        }
        self.active_objects = []
    
    def get_object(self, obj_type: str):
        """Get an object from the pool or create new if pool is empty"""
        if self.object_pool[obj_type]:
            return self.object_pool[obj_type].pop()
        return None
    
    def return_object(self, obj, obj_type: str):
        """Return an object to the pool"""
        self.object_pool[obj_type].append(obj)
    
    def clear_active_objects(self):
        """Clear all active objects"""
        for obj in self.active_objects:
            obj_type = obj.__class__.__name__.lower() + 's'
            self.return_object(obj, obj_type)
        self.active_objects.clear()
    
    def add_active_object(self, obj):
        """Add an object to active objects list"""
        self.active_objects.append(obj)
    
    def get_active_objects(self):
        """Get all active objects"""
        return self.active_objects 