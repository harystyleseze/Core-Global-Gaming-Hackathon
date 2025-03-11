import pygame
import random
from collections import defaultdict
from game_state import GameState, MemoryManager

pygame.init()

# Game constants
w_width = 660
w_height = 600
GRID_SIZE = 80
GRID_OFFSET_X = 100
GRID_OFFSET_Y = 100
GRID_COLS = 6
GRID_ROWS = 5

# Initialize game window and state
window = pygame.display.set_mode((w_width, w_height))
pygame.display.set_caption("Space Puzzle")
game_state = GameState()
memory_manager = MemoryManager()

# Loading images
bg = pygame.image.load("media/bg.png")
bg = pygame.transform.scale(bg, (w_width, w_height))
spaceship_img = pygame.image.load("media/spaceship.png")
asteroid_img = pygame.image.load("media/alien1.png")
key_img = pygame.image.load("media/alien_bullet.png")
portal_img = pygame.image.load("media/alien3.png")
barrier_img = pygame.image.load("media/alien4.png")

# Import sounds
collect_sound = pygame.mixer.Sound("media/laser.wav")
complete_sound = pygame.mixer.Sound("media/explosion2.wav")
error_sound = pygame.mixer.Sound("media/explosion.wav")

# Game variables
clock = pygame.time.Clock()
font = pygame.font.SysFont("helvetica", 30, 1, 1)
game_objects = []
grid_objects = defaultdict(list)

# Classes
class Spaceship():
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 75
        self.height = 75
        self.vel = 8
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.grid_x = 0
        self.grid_y = 0
        
    def draw(self, window):
        window.blit(spaceship_img, (self.x, self.y))
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
    def move_to_grid(self, grid_x, grid_y):
        # Convert grid position to pixel coordinates
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = 100 + (grid_x * 80)
        self.y = 100 + (grid_y * 80)
        
class Asteroid():
    def __init__(self, grid_x, grid_y):
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = 100 + (grid_x * 80)
        self.y = 100 + (grid_y * 80)
        self.width = 64
        self.height = 64
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
    def draw(self, window):
        window.blit(asteroid_img, (self.x, self.y))
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
class Key():
    def __init__(self, grid_x, grid_y, color=(255, 255, 255)):
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = GRID_OFFSET_X + (grid_x * GRID_SIZE) + 20
        self.y = GRID_OFFSET_Y + (grid_y * GRID_SIZE) + 20
        self.width = 30
        self.height = 30
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.collected = False
        self.color = color
        
    def draw(self, window):
        if not self.collected:
            key_surface = key_img.copy()
            key_surface.fill(self.color, special_flags=pygame.BLEND_RGB_MULT)
            window.blit(key_surface, (self.x, self.y))
            self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
            
class Portal():
    def __init__(self, grid_x, grid_y):
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = 100 + (grid_x * 80)
        self.y = 100 + (grid_y * 80)
        self.width = 64
        self.height = 64
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.active = False
        
    def draw(self, window):
        if self.active:
            window.blit(portal_img, (self.x, self.y))
        else:
            # Draw inactive portal (dimmed)
            dimmed = portal_img.copy()
            dimmed.fill((100, 100, 100), special_flags=pygame.BLEND_RGB_MULT)
            window.blit(dimmed, (self.x, self.y))
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
class Barrier():
    def __init__(self, grid_x, grid_y, color=(255, 255, 255)):
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = GRID_OFFSET_X + (grid_x * GRID_SIZE)
        self.y = GRID_OFFSET_Y + (grid_y * GRID_SIZE)
        self.width = 64
        self.height = 64
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.color = color
        
    def draw(self, window):
        barrier_surface = barrier_img.copy()
        barrier_surface.fill(self.color, special_flags=pygame.BLEND_RGB_MULT)
        window.blit(barrier_surface, (self.x, self.y))
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

class Teleporter():
    def __init__(self, grid_x, grid_y, pair_id):
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.x = GRID_OFFSET_X + (grid_x * GRID_SIZE)
        self.y = GRID_OFFSET_Y + (grid_y * GRID_SIZE)
        self.width = 64
        self.height = 64
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.pair_id = pair_id
        self.color = (0, 255, 255) if pair_id == 1 else (255, 0, 255)
        
    def draw(self, window):
        pygame.draw.circle(window, self.color, (self.x + 32, self.y + 32), 25)
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)

# Game functions
def update_grid_objects():
    """Update the grid-based object lookup dictionary"""
    global grid_objects
    grid_objects.clear()
    for obj in game_objects:
        if hasattr(obj, 'grid_x') and hasattr(obj, 'grid_y'):
            grid_objects[(obj.grid_x, obj.grid_y)].append(obj)

def get_objects_at(x, y):
    """Get all objects at a grid position"""
    return grid_objects.get((x, y), [])

def generate_level(level_num):
    max_attempts = 50  # Maximum attempts to generate a valid level
    
    for attempt in range(max_attempts):
        game_objects.clear()
        grid_objects.clear()
        
        # Get level configuration
        config = game_state.get_level_config()
        
        # Create grid-based puzzle
        grid = [[0 for x in range(GRID_COLS)] for y in range(GRID_ROWS)]
        
        # Place the spaceship at starting position
        spaceship.move_to_grid(0, 2)
        grid[2][0] = 1
        
        # Place portal at the opposite side
        portal = Portal(5, 2)
        game_objects.append(portal)
        grid[2][5] = 2
        
        # Available colors for keys and barriers
        colors = [
            (255, 0, 0),    # Red
            (0, 255, 0),    # Green
            (0, 0, 255),    # Blue
            (255, 255, 0),  # Yellow
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Cyan
            (255, 128, 0),  # Orange
            (128, 0, 255),  # Purple
        ]
        
        # Track key and teleporter positions for validation
        key_positions = []
        teleporter_pairs = {}
        
        # Place colored keys and matching barriers
        for i in range(config.num_keys):
            color = colors[i % len(colors)]
            # Place key
            for _ in range(20):  # Try 20 times to place each key
                x = random.randint(1, 4)
                y = random.randint(0, 4)
                if grid[y][x] == 0:
                    grid[y][x] = 3
                    key = Key(x, y, color)
                    game_objects.append(key)
                    key_positions.append((x, y))
                    break
            
            # Place matching colored barrier
            for _ in range(20):  # Try 20 times to place each barrier
                x = random.randint(1, 4)
                y = random.randint(0, 4)
                if grid[y][x] == 0:
                    grid[y][x] = 5
                    game_objects.append(Barrier(x, y, color))
                    break
        
        # Place teleporter pairs
        if config.num_teleporters > 0:
            for pair_id in range(config.num_teleporters):
                # Place first teleporter
                x1, y1 = None, None
                for _ in range(20):
                    x = random.randint(1, 4)
                    y = random.randint(0, 4)
                    if grid[y][x] == 0:
                        grid[y][x] = 6
                        game_objects.append(Teleporter(x, y, pair_id))
                        x1, y1 = x, y
                        break
                
                # Place second teleporter
                if x1 is not None:
                    for _ in range(20):
                        x = random.randint(1, 4)
                        y = random.randint(0, 4)
                        if grid[y][x] == 0:
                            grid[y][x] = 6
                            game_objects.append(Teleporter(x, y, pair_id))
                            teleporter_pairs[(x1, y1)] = (x, y)
                            teleporter_pairs[(x, y)] = (x1, y1)
                            break
        
        # Place asteroids (obstacles)
        for i in range(config.num_asteroids):
            for _ in range(20):  # Try 20 times to place each asteroid
                x = random.randint(1, 4)
                y = random.randint(0, 4)
                if grid[y][x] == 0:
                    grid[y][x] = 4
                    game_objects.append(Asteroid(x, y))
                    break
        
        # Validate level solvability
        if game_state.path_validator.validate_level(
            grid=grid,
            keys=key_positions,
            portal=(5, 2),
            teleporters=teleporter_pairs,
            grid_size=(GRID_COLS, GRID_ROWS)
        ):
            update_grid_objects()
            return config.num_keys
    
    # If we couldn't generate a valid level, try with fewer objects
    config.num_asteroids = max(1, config.num_asteroids - 2)
    config.num_teleporters = max(0, config.num_teleporters - 1)
    return generate_level(level_num)  # Recursive call with simpler configuration

def display_status():
    level_text = font.render(f"Level: {game_state.level}", 1, "white")
    keys_text = font.render(f"Total Keys: {game_state.total_keys}", 1, "white")
    score_text = font.render(f"Score: {game_state.score}", 1, "white")
    high_score_text = font.render(f"High Score: {game_state.high_score}", 1, "white")
    
    window.blit(level_text, [10, 10])
    window.blit(keys_text, [10, 50])
    window.blit(score_text, [10, 90])
    window.blit(high_score_text, [10, 130])

def draw_grid():
    for x in range(6):
        for y in range(5):
            rect = pygame.Rect(100 + (x * 80), 100 + (y * 80), 80, 80)
            pygame.draw.rect(window, (50, 50, 70), rect, 1)

def check_move(new_x, new_y):
    # Check if move is valid (within grid)
    if new_x < 0 or new_x > 5 or new_y < 0 or new_y > 4:
        return False
    
    # Get all objects at the target position
    objects_at_pos = get_objects_at(new_x, new_y)
    
    # Check for asteroid (blocking)
    if any(isinstance(obj, Asteroid) for obj in objects_at_pos):
        return False
            
    # Check for barrier
    for obj in objects_at_pos:
        if isinstance(obj, Barrier):
            if game_state.use_key():  # Use a key from total keys
                game_objects.remove(obj)
                collect_sound.play()
                update_grid_objects()
                return True
            else:
                error_sound.play()
                return False
    
    # Check for teleporter
    for obj in objects_at_pos:
        if isinstance(obj, Teleporter):
            # Find paired teleporter
            paired_teleporter = next((t for t in game_objects 
                                    if isinstance(t, Teleporter) 
                                    and t.pair_id == obj.pair_id 
                                    and t != obj), None)
            if paired_teleporter:
                spaceship.move_to_grid(paired_teleporter.grid_x, paired_teleporter.grid_y)
                collect_sound.play()
                return False
    
    return True

def check_key_collection():
    objects_at_pos = get_objects_at(spaceship.grid_x, spaceship.grid_y)
    
    for obj in objects_at_pos:
        if isinstance(obj, Key) and not obj.collected:
            obj.collected = True
            game_state.collect_key()
            collect_sound.play()
            update_grid_objects()

def check_portal():
    objects_at_pos = get_objects_at(spaceship.grid_x, spaceship.grid_y)
    
    for obj in objects_at_pos:
        if isinstance(obj, Portal) and obj.active:
            complete_sound.play()
            game_state.complete_level()
            return True
    return False

def update_portal_status():
    # Activate portal if all keys are collected
    portals = [obj for obj in game_objects if isinstance(obj, Portal)]
    keys = [obj for obj in game_objects if isinstance(obj, Key)]
    
    all_keys_collected = all(key.collected for key in keys)
    for portal in portals:
        portal.active = all_keys_collected
            
def DrawInGameLoop():
    clock.tick(60)
    window.blit(bg, (0, 0))
    draw_grid()
    display_status()
    spaceship.draw(window)
    for obj in game_objects:
        obj.draw(window)
    pygame.display.flip()

def draw_pause_menu():
    # Draw semi-transparent overlay
    overlay = pygame.Surface((w_width, w_height))
    overlay.fill((0, 0, 0))
    overlay.set_alpha(128)
    window.blit(overlay, (0, 0))
    
    # Draw menu text
    pause_text = font.render("GAME PAUSED", 1, "white")
    continue_text = font.render("Press P to Continue", 1, "white")
    restart_text = font.render("Press R to Restart", 1, "white")
    quit_text = font.render("Press ESC to Quit", 1, "white")
    
    window.blit(pause_text, [w_width//2 - pause_text.get_width()//2, 200])
    window.blit(continue_text, [w_width//2 - continue_text.get_width()//2, 250])
    window.blit(restart_text, [w_width//2 - restart_text.get_width()//2, 300])
    window.blit(quit_text, [w_width//2 - quit_text.get_width()//2, 350])
    
    pygame.display.flip()

def reset_game():
    game_state.reset_game()
    memory_manager.clear_active_objects()
    spaceship.move_to_grid(0, 2)
    return generate_level(game_state.level)

def draw_game_over():
    # Draw semi-transparent overlay
    overlay = pygame.Surface((w_width, w_height))
    overlay.fill((0, 0, 0))
    overlay.set_alpha(192)
    window.blit(overlay, (0, 0))
    
    # Draw game over message
    game_over_text = font.render("GAME OVER - No Keys Left!", 1, "white")
    score_text = font.render(f"Final Score: {game_state.score}", 1, "white")
    level_text = font.render(f"Levels Completed: {game_state.level - 1}", 1, "white")
    restart_text = font.render("Press R to Play Again", 1, "white")
    quit_text = font.render("Press ESC to Quit", 1, "white")
    
    window.blit(game_over_text, [w_width//2 - game_over_text.get_width()//2, 180])
    window.blit(score_text, [w_width//2 - score_text.get_width()//2, 230])
    window.blit(level_text, [w_width//2 - level_text.get_width()//2, 280])
    window.blit(restart_text, [w_width//2 - restart_text.get_width()//2, 330])
    window.blit(quit_text, [w_width//2 - quit_text.get_width()//2, 380])
    
    pygame.display.flip()

# Initialize game
spaceship = Spaceship(100, 260)
total_keys_needed = generate_level(game_state.level)

# Game loop
run = True
paused = False

while run:
    clock.tick(60)
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            run = False
            
        if event.type == pygame.KEYDOWN:
            if game_state.game_over:
                if event.key == pygame.K_r:  # Restart game
                    total_keys_needed = reset_game()
                elif event.key == pygame.K_ESCAPE:
                    run = False
            else:
                if event.key == pygame.K_p:  # Toggle pause
                    paused = not paused
                elif event.key == pygame.K_r:  # Restart game
                    total_keys_needed = reset_game()
                    paused = False
                elif event.key == pygame.K_ESCAPE:
                    if paused:
                        run = False
                elif not paused:  # Handle movement only when not paused
                    new_x, new_y = spaceship.grid_x, spaceship.grid_y
                    
                    if event.key == pygame.K_LEFT:
                        new_x -= 1
                    elif event.key == pygame.K_RIGHT:
                        new_x += 1
                    elif event.key == pygame.K_UP:
                        new_y -= 1
                    elif event.key == pygame.K_DOWN:
                        new_y += 1
                        
                    if check_move(new_x, new_y):
                        spaceship.move_to_grid(new_x, new_y)
                        check_key_collection()
                        update_portal_status()
                        if check_portal():
                            total_keys_needed = generate_level(game_state.level)
    
    if game_state.game_over:
        draw_game_over()
    elif paused:
        draw_pause_menu()
    else:
        DrawInGameLoop()

pygame.quit()